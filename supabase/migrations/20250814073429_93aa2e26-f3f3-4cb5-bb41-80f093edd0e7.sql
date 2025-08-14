-- Create the missing view for popular long stay cities in Senegal
CREATE OR REPLACE VIEW public.popular_long_stay_cities_senegal AS
SELECT 
    p.city,
    COUNT(b.id) as bookings_count
FROM public.properties p
LEFT JOIN public.bookings b ON p.id = b.property_id
WHERE p.country = 'Sénégal' 
    AND (b.is_monthly = true OR p.is_monthly = true)
GROUP BY p.city
HAVING COUNT(b.id) > 0
ORDER BY bookings_count DESC;