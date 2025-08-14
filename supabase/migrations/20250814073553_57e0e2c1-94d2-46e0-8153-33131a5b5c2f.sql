-- Fix the security definer view by recreating it as a simple view
DROP VIEW IF EXISTS public.popular_long_stay_cities_senegal;

CREATE VIEW public.popular_long_stay_cities_senegal AS
SELECT 
    p.city,
    COUNT(p.id) as bookings_count
FROM public.properties p
WHERE p.country = 'Sénégal' 
    AND p.long_term_enabled = true
    AND p.is_active = true
GROUP BY p.city
HAVING COUNT(p.id) > 0
ORDER BY bookings_count DESC;