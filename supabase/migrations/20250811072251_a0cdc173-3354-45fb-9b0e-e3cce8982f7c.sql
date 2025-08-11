-- Enable detailed WAL for realtime
ALTER TABLE public.property_availability REPLICA IDENTITY FULL;

-- Add table to supabase_realtime publication if not already there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'property_availability'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.property_availability';
  END IF;
END $$;