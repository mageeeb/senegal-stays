-- Fix critical security vulnerability in profiles table
-- Replace the dangerous "view all profiles" policy with a restrictive one
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Recreate the popular_long_stay_cities_senegal view without SECURITY DEFINER
-- First drop the existing view
DROP VIEW IF EXISTS public.popular_long_stay_cities_senegal;

-- Create a standard view (without SECURITY DEFINER)
CREATE VIEW public.popular_long_stay_cities_senegal AS
SELECT 
  city,
  COUNT(*) as bookings_count
FROM properties p
JOIN bookings b ON p.id = b.property_id
WHERE p.country = 'Senegal'
GROUP BY city
HAVING COUNT(*) > 0
ORDER BY bookings_count DESC;