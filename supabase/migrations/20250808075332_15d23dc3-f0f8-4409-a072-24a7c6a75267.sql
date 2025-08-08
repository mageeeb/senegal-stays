-- Ensure unique availability per property/date
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_availability_unique
ON public.property_availability (property_id, date);

-- Create or replace the trigger to block nights after a booking is created
DROP TRIGGER IF EXISTS trg_block_booked_dates ON public.bookings;
CREATE TRIGGER trg_block_booked_dates
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.block_booked_dates();