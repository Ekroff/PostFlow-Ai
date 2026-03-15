export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'pro' | 'agency';
export type UserRole = 'admin' | 'editor' | 'reviewer' | 'author';
export type PostStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'publish_failed';
export type PostFormat =
  | 'story'
  | 'insight'
  | 'list'
  | 'hot_take'
  | 'how_to'
  | 'behind_the_scenes'
  | 'poll'
  | 'engagement';
export type PostTone =
  | 'professional'
  | 'conversational'
  | 'bold'
  | 'inspirational'
  | 'educational';
export type PostLength = 'short' | 'medium' | 'long' | 'thread';
export type PostHookStyle =
  | 'question'
  | 'bold_statement'
  | 'surprising_stat'
  | 'personal_story'
  | 'contrarian';

export type User = {
  id: string;
  clerk_user_id: string;
  email: string;
  workspace_id: string | null;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  linkedin_oauth_token: string | null;
  linkedin_refresh_token: string | null;
  linkedin_urn: string | null;
  created_at: string;
  updated_at: string;
};

export type Workspace = {
  id: string;
  name: string;
  owner_id: string;
  subscription_tier: SubscriptionTier;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type BrandProfile = {
  id: string;
  user_id: string;
  product_name: string;
  product_description: string;
  primary_audience: string;
  tone_score: number | null;
  avg_sentence_length: 'short' | 'medium' | 'long';
  emoji_usage: 'none' | 'minimal' | 'moderate' | 'heavy';
  hook_style_preferences: string[];
  signature_phrases: string[];
  avoid_phrases: string[];
  cta_style: 'soft' | 'direct' | 'question';
  brand_voice_keywords: string[];
  questionnaire_answers: Record<string, unknown>;
  sample_posts_raw: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  workspace_id: string;
  author_id: string;
  content: string;
  format_type: PostFormat;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  linkedin_post_id: string | null;
  char_count: number | null;
  hashtags: string[];
  topic_text: string | null;
  performance_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: User;
};

export type PostVersion = {
  id: string;
  post_id: string;
  content: string;
  edited_by: string | null;
  version_num: number;
  created_at: string;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  resolved: boolean;
  created_at: string;
  user?: User;
};

export type UsageTracking = {
  id: string;
  user_id: string;
  action_type: string;
  month_year: string;
  count: number;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Partial<User> & { clerk_user_id: string; email: string };
        Update: Partial<User>;
        Relationships: [];
      };
      workspaces: {
        Row: Workspace;
        Insert: Partial<Workspace> & { name: string };
        Update: Partial<Workspace>;
        Relationships: [];
      };
      brand_profiles: {
        Row: BrandProfile;
        Insert: Partial<BrandProfile> & {
          user_id: string;
          product_name: string;
          product_description: string;
          primary_audience: string;
        };
        Update: Partial<BrandProfile>;
        Relationships: [];
      };
      posts: {
        Row: Post;
        Insert: Partial<Post> & {
          workspace_id: string;
          author_id: string;
          content: string;
          format_type: PostFormat;
        };
        Update: Partial<Post>;
        Relationships: [];
      };
      post_versions: {
        Row: PostVersion;
        Insert: Partial<PostVersion> & { post_id: string; content: string; version_num: number };
        Update: Partial<PostVersion>;
        Relationships: [];
      };
      post_comments: {
        Row: PostComment;
        Insert: Partial<PostComment> & { post_id: string; user_id: string; content: string };
        Update: Partial<PostComment>;
        Relationships: [];
      };
      usage_tracking: {
        Row: UsageTracking;
        Insert: Partial<UsageTracking> & {
          user_id: string;
          action_type: string;
          month_year: string;
        };
        Update: Partial<UsageTracking>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
  };
}
