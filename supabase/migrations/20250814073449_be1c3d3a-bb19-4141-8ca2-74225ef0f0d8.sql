-- Add missing columns to bookings table for long-term stays
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS is_monthly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS months_count integer,
ADD COLUMN IF NOT EXISTS monthly_unit_price numeric(10,2);

-- Create the view for popular long stay cities in Senegal  
CREATE OR REPLACE VIEW public.popular_long_stay_cities_senegal AS
SELECT 
    p.city,
    COUNT(CASE WHEN b.is_monthly = true THEN 1 END) as bookings_count
FROM public.properties p
LEFT JOIN public.bookings b ON p.id = b.property_id
WHERE p.country = 'Sénégal' 
    AND p.is_monthly = true
GROUP BY p.city
HAVING COUNT(CASE WHEN b.is_monthly = true THEN 1 END) > 0
ORDER BY bookings_count DESC;