-- Add met_at_note column to contacts table
-- This field stores additional information about where and how you first met (location, occasion, etc.)

DO $$
BEGIN
    -- Check if column exists, if not add it
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'contacts'
        AND column_name = 'met_at_note'
    ) THEN
        ALTER TABLE contacts ADD COLUMN met_at_note TEXT;
        RAISE NOTICE 'added met_at_note column to contacts table';
    ELSE
        RAISE NOTICE 'met_at_note column already exists in contacts table';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN contacts.met_at_note IS 'Additional notes about when/where you first met (location, occasion, etc.)';
