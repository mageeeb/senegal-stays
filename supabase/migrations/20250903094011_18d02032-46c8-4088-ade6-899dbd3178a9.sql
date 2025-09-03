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