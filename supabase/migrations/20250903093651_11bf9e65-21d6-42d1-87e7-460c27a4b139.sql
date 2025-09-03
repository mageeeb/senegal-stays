-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'host', 'super_admin');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create property validation criteria table
CREATE TABLE public.validation_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default validation criteria
INSERT INTO public.validation_criteria (name, description) VALUES
('cleanliness', 'Propreté des lieux'),
('sound_quality', 'Qualité sonore conforme aux normes'),
('air_quality', 'Qualité d''air conforme aux normes'),
('lighting', 'Luminosité appropriée'),
('host_friendliness', 'Hôte agréable et accueillant'),
('meal_quality', 'Repas conforme aux standards');

-- Create property evaluations table
CREATE TABLE public.property_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    evaluator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    criteria_id UUID REFERENCES public.validation_criteria(id) ON DELETE CASCADE NOT NULL,
    score INTEGER CHECK (score >= 1 AND score <= 5) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (property_id, criteria_id)
);

-- Enable RLS on new tables
ALTER TABLE public.validation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_evaluations ENABLE ROW LEVEL SECURITY;

-- Add validation status to properties
ALTER TABLE public.properties ADD COLUMN validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.properties ADD COLUMN validated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.properties ADD COLUMN validated_at TIMESTAMP WITH TIME ZONE;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for validation_criteria
CREATE POLICY "Anyone can view validation criteria"
ON public.validation_criteria
FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage validation criteria"
ON public.validation_criteria
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for property_evaluations
CREATE POLICY "Super admins can manage evaluations"
ON public.property_evaluations
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Property hosts can view their property evaluations"
ON public.property_evaluations
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = property_evaluations.property_id 
    AND properties.host_id = auth.uid()
));

-- Update properties policies for super admin
CREATE POLICY "Super admins can delete any property"
ON public.properties
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update any property"
ON public.properties
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));

-- Function to assign super admin role to specific email
CREATE OR REPLACE FUNCTION public.assign_super_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the new user's email is the super admin email
  IF NEW.email = 'nanouchkaly@yahoo.fr' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign super admin role
CREATE TRIGGER assign_super_admin_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_super_admin_role();