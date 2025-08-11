-- Long-term stays MVP: schema changes
BEGIN;

-- Properties: long-term configuration
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS long_term_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS monthly_price NUMERIC(12,0),
  ADD COLUMN IF NOT EXISTS min_months INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_months INTEGER NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS utilities_included BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS utilities_notes TEXT,
  ADD COLUMN IF NOT EXISTS notice_period_days INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS furnished BOOLEAN NOT NULL DEFAULT true;

-- Bookings: support long-term bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_type TEXT NOT NULL DEFAULT 'short', -- 'short' | 'long'
  ADD COLUMN IF NOT EXISTS start_date DATE, -- for long bookings (month-based)
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT, -- e.g., 'monthly'
  ADD COLUMN IF NOT EXISTS first_invoice_amount NUMERIC(12,0) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS recurring_amount NUMERIC(12,0) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS long_deposit_amount NUMERIC(12,0) DEFAULT 0;

-- Contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft','signed'
  url TEXT, -- link to stored PDF/HTML if any
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoices table for long-term
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount NUMERIC(12,0) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  status TEXT NOT NULL DEFAULT 'due', -- 'due','paid','failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for new tables
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies: guests and hosts can view related
CREATE POLICY IF NOT EXISTS "Guests and hosts can view related contracts" ON public.contracts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.properties p ON p.id = b.property_id
    WHERE b.id = contracts.booking_id
      AND (b.guest_id = auth.uid() OR p.host_id = auth.uid())
  )
);

CREATE POLICY IF NOT EXISTS "Guests can insert contracts for their bookings" ON public.contracts
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b WHERE b.id = contracts.booking_id AND b.guest_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Hosts or guests can update related contracts" ON public.contracts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.properties p ON p.id = b.property_id
    WHERE b.id = contracts.booking_id
      AND (b.guest_id = auth.uid() OR p.host_id = auth.uid())
  )
);

CREATE POLICY IF NOT EXISTS "Guests and hosts can view related invoices" ON public.invoices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.properties p ON p.id = b.property_id
    WHERE b.id = invoices.booking_id
      AND (b.guest_id = auth.uid() OR p.host_id = auth.uid())
  )
);

CREATE POLICY IF NOT EXISTS "Hosts can insert invoices for their bookings" ON public.invoices
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.properties p ON p.id = b.property_id
    WHERE b.id = invoices.booking_id AND p.host_id = auth.uid()
  )
);

-- Modify pricing trigger to skip long bookings
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
  -- For long bookings, skip nightly calculation
  IF NEW.booking_type IS NOT NULL AND NEW.booking_type <> 'short' THEN
    RETURN NEW;
  END IF;

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

COMMIT;