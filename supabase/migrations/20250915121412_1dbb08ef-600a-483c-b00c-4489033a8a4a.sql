-- Create vehicle reviews table
CREATE TABLE public.vehicle_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,  
  booking_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vehicle_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicle reviews
CREATE POLICY "Anyone can view vehicle reviews" 
ON public.vehicle_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Guests can create reviews for their vehicle bookings" 
ON public.vehicle_reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = reviewer_id AND 
  EXISTS (
    SELECT 1 FROM vehicle_bookings 
    WHERE vehicle_bookings.id = vehicle_reviews.booking_id 
    AND vehicle_bookings.user_id = auth.uid() 
    AND vehicle_bookings.status = 'completed'
  )
);

-- Add foreign key constraints
ALTER TABLE public.vehicle_reviews 
ADD CONSTRAINT fk_vehicle_reviews_vehicle_id 
FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;

ALTER TABLE public.vehicle_reviews 
ADD CONSTRAINT fk_vehicle_reviews_reviewer_id 
FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.vehicle_reviews 
ADD CONSTRAINT fk_vehicle_reviews_booking_id 
FOREIGN KEY (booking_id) REFERENCES public.vehicle_bookings(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_vehicle_reviews_vehicle_id ON public.vehicle_reviews(vehicle_id);
CREATE INDEX idx_vehicle_reviews_reviewer_id ON public.vehicle_reviews(reviewer_id);
CREATE INDEX idx_vehicle_reviews_created_at ON public.vehicle_reviews(created_at DESC);