-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Basic Info
    name TEXT NOT NULL,
    english_name TEXT,
    title TEXT,
    department TEXT,
    company TEXT,
    avatar_url TEXT,
    industry TEXT,

    -- Category & Timing
    category TEXT NOT NULL DEFAULT 'restart',
    last_contact TIMESTAMPTZ DEFAULT NOW(),
    met_at DATE,
    birthday DATE,

    -- Emails (two types)
    email TEXT,
    personal_email TEXT,
    work_email TEXT,

    -- Phones (four types)
    phone TEXT,
    mobile_phone TEXT,
    home_phone TEXT,
    work_phone TEXT,
    work_fax TEXT,
    landline TEXT,
    fax TEXT,

    -- Addresses (four types)
    address TEXT,
    company_address TEXT,
    office_address TEXT,
    home_address TEXT,
    mailing_address TEXT,
    address2 TEXT,
    address3 TEXT,

    -- Social Media
    linkedin TEXT,
    line TEXT,
    wechat TEXT,
    whatsapp TEXT,
    facebook TEXT,
    instagram TEXT,
    threads TEXT,

    -- Website
    website TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts(user_id);
CREATE INDEX IF NOT EXISTS contacts_last_contact_idx ON contacts(last_contact DESC);
CREATE INDEX IF NOT EXISTS contacts_category_idx ON contacts(category);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;

-- RLS Policies: Users can only access their own contacts
CREATE POLICY "Users can view their own contacts"
    ON contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
    ON contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
    ON contacts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
    ON contacts FOR DELETE
    USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
