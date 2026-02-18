-- Create social_connections table
-- This table stores access tokens and metadata for social media integrations

CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Platform information
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'line', 'wechat')),

  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,

  -- Token expiration
  expires_at TIMESTAMPTZ NOT NULL,

  -- Profile information
  profile_url TEXT,

  -- Sync tracking
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'active', -- 'active', 'disabled', 'error'

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one connection per platform per user
  UNIQUE (user_id, platform)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS social_connections_user_id_idx ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS social_connections_platform_idx ON social_connections(platform);
CREATE INDEX IF NOT EXISTS social_connections_expires_at_idx ON social_connections(expires_at);

-- Enable Row Level Security
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own social connections" ON social_connections;
DROP POLICY IF EXISTS "Users can insert own social connections" ON social_connections;
DROP POLICY IF EXISTS "Users can update own social connections" ON social_connections;
DROP POLICY IF EXISTS "Users can delete own social connections" ON social_connections;

CREATE POLICY "Users can view own social connections"
    ON social_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social connections"
    ON social_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social connections"
    ON social_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social connections"
    ON social_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Create social_activities table
-- This table stores activities synced from social media platforms

CREATE TABLE IF NOT EXISTS social_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'line', 'wechat')),

  -- Activity details
  activity_id TEXT, -- Original ID from the platform
  activity_type TEXT NOT NULL CHECK (activity_type IN ('post', 'comment', 'like', 'share')),
  content TEXT NOT NULL,

  -- Contact association
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  -- Additional metadata
  url TEXT,
  metadata JSONB DEFAULT '{}',

  -- Story association (if this activity used a story)
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,

  -- Impact tracking
  impact JSONB DEFAULT '{}',

  -- Timestamps
  platform_created_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate activities
  UNIQUE (user_id, platform, activity_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS social_activities_user_id_idx ON social_activities(user_id);
CREATE INDEX IF NOT EXISTS social_activities_platform_idx ON social_activities(platform);
CREATE INDEX IF NOT EXISTS social_activities_contact_id_idx ON social_activities(contact_id);
CREATE INDEX IF NOT EXISTS social_activities_created_at_idx ON social_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS social_activities_story_id_idx ON social_activities(story_id);

-- Enable Row Level Security
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own social activities" ON social_activities;
DROP POLICY IF EXISTS "Users can insert own social activities" ON social_activities;
DROP POLICY IF EXISTS "Users can update own social activities" ON social_activities;
DROP POLICY IF EXISTS "Users can delete own social activities" ON social_activities;

CREATE POLICY "Users can view own social activities"
    ON social_activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social activities"
    ON social_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social activities"
    ON social_activities FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social activities"
    ON social_activities FOR DELETE
    USING (auth.uid() = user_id);

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_social_connections_updated_at ON social_connections;

CREATE TRIGGER update_social_connections_updated_at
    BEFORE UPDATE ON social_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_activities_updated_at ON social_activities;

CREATE TRIGGER update_social_activities_updated_at
    BEFORE UPDATE ON social_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
