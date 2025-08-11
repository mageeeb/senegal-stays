-- Add available_from to properties for long-term availability
BEGIN;
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS available_from DATE;
COMMIT;
