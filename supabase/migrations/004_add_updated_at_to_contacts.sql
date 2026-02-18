-- Add updated_at column to contacts table if it doesn't exist
-- This migration fixes the missing updated_at field that causes trigger errors

DO $$
BEGIN
    -- Check if column exists, if not add it
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'contacts'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE contacts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'added updated_at column to contacts table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in contacts table';
    END IF;
END $$;

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
