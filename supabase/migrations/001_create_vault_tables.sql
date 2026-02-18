-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Value Domains Table
CREATE TABLE IF NOT EXISTS value_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '💎',
  color VARCHAR(7) DEFAULT '#ee8c2b',
  story_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES value_domains(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Story Insights Table
CREATE TABLE IF NOT EXISTS story_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'line', 'wechat', 'email')),
  result VARCHAR(10) NOT NULL CHECK (result IN ('positive', 'neutral', 'negative')),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_value_domains_user_id ON value_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_domain_id ON stories(domain_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_domain ON stories(user_id, domain_id);
CREATE INDEX IF NOT EXISTS idx_story_insights_story_id ON story_insights(story_id);
CREATE INDEX IF NOT EXISTS idx_story_insights_contact_id ON story_insights(contact_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_value_domains_updated_at BEFORE UPDATE ON value_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment domain story count
CREATE OR REPLACE FUNCTION increment_domain_story_count(domain_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE value_domains
  SET story_count = story_count + 1
  WHERE id = domain_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement domain story count
CREATE OR REPLACE FUNCTION decrement_domain_story_count(domain_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE value_domains
  SET story_count = GREATEST(story_count - 1, 0)
  WHERE id = domain_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE value_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for value_domains
CREATE POLICY "Users can view their own value domains"
  ON value_domains FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own value domains"
  ON value_domains FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own value domains"
  ON value_domains FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own value domains"
  ON value_domains FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for stories
CREATE POLICY "Users can view their own stories"
  ON stories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for story_insights
CREATE POLICY "Users can view their own story insights"
  ON story_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own story insights"
  ON story_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story insights"
  ON story_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own story insights"
  ON story_insights FOR DELETE
  USING (auth.uid() = user_id);
