-- Create vehicle_images table similar to property_images
CREATE TABLE public.vehicle_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicle images
CREATE POLICY "Anyone can view vehicle images" 
ON public.vehicle_images 
FOR SELECT 
USING (true);

CREATE POLICY "Vehicle owners can manage images" 
ON public.vehicle_images 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.vehicles 
  WHERE vehicles.id = vehicle_images.vehicle_id 
  AND vehicles.owner_id = auth.uid()
));

-- Add owner_id column to vehicles table to track ownership
ALTER TABLE public.vehicles 
ADD COLUMN owner_id UUID;

-- Update existing vehicles to have no owner (they will need to be claimed)
-- In a real scenario, you would set proper ownership

-- Create policy to allow users to manage their own vehicles
CREATE POLICY "Vehicle owners can manage their vehicles" 
ON public.vehicles 
FOR ALL 
USING (auth.uid() = owner_id);

-- Allow users to insert vehicles they own
CREATE POLICY "Users can insert their own vehicles" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Update the existing "Anyone can view available vehicles" policy to work with the new structure
DROP POLICY IF EXISTS "Anyone can view available vehicles" ON public.vehicles;
CREATE POLICY "Anyone can view available vehicles" 
ON public.vehicles 
FOR SELECT 
USING (is_available = true);