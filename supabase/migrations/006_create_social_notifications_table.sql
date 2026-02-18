-- Create social_notifications table
-- This table stores parsed social media notification emails
-- Instead of using APIs, we parse notification emails from Gmail

CREATE TABLE IF NOT EXISTS social_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Platform information
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram')),

  -- Notification type
  type TEXT NOT NULL CHECK (type IN (
    'post',           -- Someone posted
    'comment',        -- Someone commented
    'mention',        -- User was mentioned
    'like',           -- Someone liked
    'connection',     -- Connection request (LinkedIn)
    'profile_view',   -- Profile viewed
    'birthday',       -- Birthday reminder
    'other'           -- Other notification
  )),

  -- Sender information
  "from" TEXT,       -- Name of the person who triggered the notification
  subject TEXT,      -- Email subject line

  -- Content
  content TEXT,      -- Parsed notification content
  url TEXT,          -- Link to the social media activity

  -- Source information
  email_message_id TEXT,  -- Gmail message ID (for deduplication)

  -- Timestamps
  timestamp TIMESTAMPTZ,  -- Original notification timestamp from email
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate notifications from same email
  UNIQUE (user_id, email_message_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS social_notifications_user_id_idx ON social_notifications(user_id);
CREATE INDEX IF NOT EXISTS social_notifications_platform_idx ON social_notifications(platform);
CREATE INDEX IF NOT EXISTS social_notifications_type_idx ON social_notifications(type);
CREATE INDEX IF NOT EXISTS social_notifications_timestamp_idx ON social_notifications(timestamp DESC);
CREATE INDEX IF NOT EXISTS social_notifications_created_at_idx ON social_notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE social_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own social notifications" ON social_notifications;
DROP POLICY IF EXISTS "Users can insert own social notifications" ON social_notifications;
DROP POLICY IF EXISTS "Users can delete own social notifications" ON social_notifications;

CREATE POLICY "Users can view own social notifications"
    ON social_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social notifications"
    ON social_notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social notifications"
    ON social_notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Update social_connections table to include Google platform
-- First, add 'google' to the platform check constraint
ALTER TABLE social_connections DROP CONSTRAINT IF EXISTS social_connections_platform_check;

ALTER TABLE social_connections
  ADD CONSTRAINT social_connections_platform_check
  CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'line', 'wechat', 'google'));

-- Add updated_at column if it doesn't exist
ALTER TABLE social_connections
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Comment explaining the email-first approach
COMMENT ON TABLE social_notifications IS 'Stores parsed social media notification emails from Gmail, providing an API-free integration approach';
COMMENT ON COLUMN social_notifications.email_message_id IS 'Gmail message ID used to prevent duplicate processing';
COMMENT ON COLUMN social_notifications."from" IS 'Name of the person who triggered the notification (parsed from email)';
COMMENT ON COLUMN social_notifications.type IS 'Notification type categorization for filtering and display';
