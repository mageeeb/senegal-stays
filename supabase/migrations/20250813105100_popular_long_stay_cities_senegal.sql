-- up.sql
CREATE OR REPLACE VIEW public.popular_long_stay_cities_senegal AS
SELECT
  p.city,
  COUNT(b.id) AS bookings_count
FROM public.bookings b
JOIN public.properties p ON p.id = b.property_id
WHERE
  p.country = 'Senegal'
  AND b.status = 'completed'
  AND (b.check_out - b.check_in) >= 28
  AND b.check_in >= (CURRENT_DATE - INTERVAL '6 months')
GROUP BY p.city
ORDER BY COUNT(b.id) DESC;

GRANT SELECT ON public.popular_long_stay_cities_senegal TO anon, authenticated;

-- down.sql
REVOKE SELECT ON public.popular_long_stay_cities_senegal FROM anon, authenticated;
DROP VIEW IF EXISTS public.popular_long_stay_cities_senegal;