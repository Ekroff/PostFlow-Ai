-- PostFlow AI — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor to create all tables, indexes, and RLS policies.

-- ============================================================
-- WORKSPACES (must be created before users due to FK reference)
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID, -- FK added after users table
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'author',
  -- 'admin' | 'editor' | 'reviewer' | 'author'
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  -- 'free' | 'starter' | 'growth' | 'pro' | 'agency'
  -- RevenueCat updates this via webhook
  linkedin_oauth_token TEXT,   -- encrypted at application level
  linkedin_refresh_token TEXT, -- encrypted at application level
  linkedin_urn VARCHAR(255),   -- LinkedIn member URN for publishing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_workspace_id ON users (workspace_id);

-- Add workspace owner FK now that users table exists
ALTER TABLE workspaces
  ADD CONSTRAINT fk_workspaces_owner
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- ============================================================
-- BRAND PROFILES (voice profiles per team member)
-- ============================================================
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL DEFAULT '',
  product_description TEXT NOT NULL DEFAULT '',
  primary_audience TEXT NOT NULL DEFAULT '',
  tone_score INTEGER CHECK (tone_score BETWEEN 1 AND 5),
  avg_sentence_length VARCHAR(20) DEFAULT 'medium',
  emoji_usage VARCHAR(20) DEFAULT 'minimal',
  hook_style_preferences TEXT[] DEFAULT '{}',
  signature_phrases TEXT[] DEFAULT '{}',
  avoid_phrases TEXT[] DEFAULT '{}',
  cta_style VARCHAR(50) DEFAULT 'direct',
  brand_voice_keywords TEXT[] DEFAULT '{}',
  questionnaire_answers JSONB DEFAULT '{}',
  sample_posts_raw TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles (user_id);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  format_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  linkedin_post_id VARCHAR(255),
  char_count INTEGER,
  hashtags TEXT[] DEFAULT '{}',
  topic_text TEXT,
  performance_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_workspace_id_status ON posts (workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts (scheduled_at)
  WHERE status = 'approved';

-- ============================================================
-- POST VERSIONS (edit history)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  edited_by UUID REFERENCES users(id),
  version_num INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_versions_post_id ON post_versions (post_id, version_num);

-- ============================================================
-- POST COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments (post_id);

-- ============================================================
-- USAGE TRACKING (per-user AI generation counts)
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'generation'
  month_year VARCHAR(7) NOT NULL,   -- 'YYYY-MM'
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action_type, month_year)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_action_month
  ON usage_tracking (user_id, action_type, month_year);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own record
CREATE POLICY "users_own_row" ON users
  USING (clerk_user_id = auth.jwt()->>'sub');

-- Workspace members can read workspace data
CREATE POLICY "workspace_read" ON workspaces
  USING (id IN (
    SELECT workspace_id FROM users
    WHERE clerk_user_id = auth.jwt()->>'sub'
  ));

-- Workspace members can read/write workspace posts
CREATE POLICY "workspace_posts_read" ON posts
  FOR SELECT USING (workspace_id IN (
    SELECT workspace_id FROM users
    WHERE clerk_user_id = auth.jwt()->>'sub'
  ));

CREATE POLICY "workspace_posts_write" ON posts
  FOR INSERT WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM users
    WHERE clerk_user_id = auth.jwt()->>'sub'
  ));

-- Only admin/editor roles can approve posts
CREATE POLICY "approve_posts" ON posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_user_id = auth.jwt()->>'sub'
      AND role IN ('admin', 'editor')
    )
  );

-- Users can only access their own brand profile
CREATE POLICY "brand_profiles_own" ON brand_profiles
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub'
  ));

-- Post versions visible to workspace members
CREATE POLICY "post_versions_workspace" ON post_versions
  USING (post_id IN (
    SELECT p.id FROM posts p
    JOIN users u ON u.workspace_id = p.workspace_id
    WHERE u.clerk_user_id = auth.jwt()->>'sub'
  ));

-- Post comments visible to workspace members
CREATE POLICY "post_comments_workspace" ON post_comments
  USING (post_id IN (
    SELECT p.id FROM posts p
    JOIN users u ON u.workspace_id = p.workspace_id
    WHERE u.clerk_user_id = auth.jwt()->>'sub'
  ));

-- Users can only see their own usage
CREATE POLICY "usage_own" ON usage_tracking
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt()->>'sub'
  ));

-- ============================================================
-- HELPER FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON brand_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
