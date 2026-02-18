-- Create sync_logs table for tracking auto-sync jobs
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  users_processed INT DEFAULT 0,
  notifications_found INT DEFAULT 0,
  linkedin_count INT DEFAULT 0,
  facebook_count INT DEFAULT 0,
  errors INT DEFAULT 0,
  error_details JSONB,
  duration_ms INT,
  success BOOLEAN DEFAULT true
);

-- Add index on started_at for querying recent syncs
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- Create index on social_connections for faster fetching of active connections
CREATE INDEX IF NOT EXISTS idx_social_connections_platform_token
ON social_connections(platform, access_token)
WHERE access_token IS NOT NULL;

-- Create index on social_notifications for duplicate checking optimization
CREATE INDEX IF NOT EXISTS idx_social_notifications_user_message
ON social_notifications(user_id, email_message_id);

-- Add comment for documentation
COMMENT ON TABLE sync_logs IS 'Tracks automatic email sync jobs run by cron';
COMMENT ON COLUMN sync_logs.started_at IS 'When the sync job started';
COMMENT ON COLUMN sync_logs.completed_at IS 'When the sync job completed';
COMMENT ON COLUMN sync_logs.users_processed IS 'Number of users processed';
COMMENT ON COLUMN sync_logs.notifications_found IS 'Total notifications found';
COMMENT ON COLUMN sync_logs.linkedin_count IS 'Number of LinkedIn notifications';
COMMENT ON COLUMN sync_logs.facebook_count IS 'Number of Facebook notifications';
COMMENT ON COLUMN sync_logs.errors IS 'Number of errors encountered';
COMMENT ON COLUMN sync_logs.error_details IS 'Detailed error information';
COMMENT ON COLUMN sync_logs.duration_ms IS 'Sync duration in milliseconds';
COMMENT ON COLUMN sync_logs.success IS 'Whether the sync completed successfully';
