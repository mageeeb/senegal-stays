-- Add missing columns to bookings table for long-term stays
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS is_monthly boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS months_count integer,
ADD COLUMN IF NOT EXISTS monthly_unit_price numeric(10,2);

-- Create the view for popular long stay cities in Senegal using correct column names
CREATE OR REPLACE VIEW public.popular_long_stay_cities_senegal AS
SELECT 
    p.city,
    COUNT(CASE WHEN b.is_monthly = true THEN 1 END) + 
    COUNT(CASE WHEN p.long_term_enabled = true THEN 1 ELSE 0 END) as bookings_count
FROM public.properties p
LEFT JOIN public.bookings b ON p.id = b.property_id
WHERE p.country = 'Sénégal' 
    AND p.long_term_enabled = true
GROUP BY p.city
ORDER BY bookings_count DESC;