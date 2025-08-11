-- Add breakdown columns to bookings and create server-side pricing calculation
BEGIN;

-- Add new columns for pricing breakdown
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS base_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_fee_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_fee_rate NUMERIC(5,4) NOT NULL DEFAULT 0.12,
  ADD COLUMN IF NOT EXISTS vat_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5,4) NOT NULL DEFAULT 0.18,
  ADD COLUMN IF NOT EXISTS cleaning_fee NUMERIC(12,0) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'FCFA';

-- Pricing calculation function
CREATE OR REPLACE FUNCTION public.calculate_booking_amounts()
RETURNS TRIGGER AS $$
DECLARE
  price_per_night NUMERIC(12,2);
  nights INTEGER;
  base NUMERIC(12,0);
  service_rate NUMERIC(5,4);
  vat_rate_val NUMERIC(5,4);
  service_fee NUMERIC(12,0);
  vat_on_service NUMERIC(12,0);
  cleaning NUMERIC(12,0);
  discount NUMERIC(12,0);
  total NUMERIC(12,0);
BEGIN
  -- Fetch price per night from property
  SELECT p.price_per_night INTO price_per_night
  FROM public.properties p
  WHERE p.id = NEW.property_id;

  IF price_per_night IS NULL THEN
    RAISE EXCEPTION 'Property price not found for property_id %', NEW.property_id;
  END IF;

  -- Compute nights (ensure non-negative)
  nights := GREATEST((NEW.check_out - NEW.check_in), 0);

  -- Default values for optional inputs
  discount := COALESCE(NEW.discount_amount, 0);
  cleaning := COALESCE(NEW.cleaning_fee, 0);
  service_rate := COALESCE(NEW.service_fee_rate, 0.12);
  vat_rate_val := COALESCE(NEW.vat_rate, 0.18);

  -- Base amount = nights * price - discount, rounded and not below 0
  base := ROUND(nights * price_per_night) - ROUND(discount);
  IF base < 0 THEN base := 0; END IF;

  -- Service fee and VAT (rounded at each step)
  service_fee := ROUND(base * service_rate);
  vat_on_service := ROUND(service_fee * vat_rate_val);

  -- Total = base + service + vat + cleaning
  total := base + service_fee + vat_on_service + cleaning;

  -- Assign back to NEW row
  NEW.base_amount := base;
  NEW.service_fee_amount := service_fee;
  NEW.vat_amount := vat_on_service;
  NEW.cleaning_fee := cleaning;
  NEW.discount_amount := discount;
  NEW.service_fee_rate := service_rate;
  NEW.vat_rate := vat_rate_val;
  NEW.currency := COALESCE(NEW.currency, 'FCFA');
  NEW.total_price := total;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate amounts before insert and before update of relevant fields
DROP TRIGGER IF EXISTS trg_calculate_booking_amounts ON public.bookings;
CREATE TRIGGER trg_calculate_booking_amounts
BEFORE INSERT OR UPDATE OF property_id, check_in, check_out, discount_amount, cleaning_fee, service_fee_rate, vat_rate
ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.calculate_booking_amounts();

COMMIT;