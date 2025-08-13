-- Add long-term stay fields to properties table
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS long_term_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS monthly_price numeric,
  ADD COLUMN IF NOT EXISTS min_months integer,
  ADD COLUMN IF NOT EXISTS max_months integer,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric,
  ADD COLUMN IF NOT EXISTS utilities_included boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS utilities_notes text,
  ADD COLUMN IF NOT EXISTS notice_period_days integer,
  ADD COLUMN IF NOT EXISTS furnished boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS available_from date;

-- Performance indexes for common filters and sorts
CREATE INDEX IF NOT EXISTS idx_properties_long_term_enabled
  ON public.properties (long_term_enabled);

CREATE INDEX IF NOT EXISTS idx_properties_long_term_active_city
  ON public.properties (city)
  WHERE (long_term_enabled = true AND is_active = true);

CREATE INDEX IF NOT EXISTS idx_properties_created_at
  ON public.properties (created_at);
