export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PostStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'publish_failed'

export type UserRole = 'admin' | 'editor' | 'reviewer' | 'author'
export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'pro' | 'agency'

// ---- Row types ----
export interface WorkspaceRow {
  id: string
  name: string
  slug: string
  subscription_tier: SubscriptionTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  settings: Json
  created_at: string
  updated_at: string
}

export interface UserRow {
  id: string
  clerk_user_id: string
  workspace_id: string | null
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  linkedin_urn: string | null
  linkedin_access_token: string | null
  linkedin_refresh_token: string | null
  linkedin_token_expires_at: string | null
  subscription_tier: SubscriptionTier
  created_at: string
  updated_at: string
}

export interface BrandProfileRow {
  id: string
  user_id: string
  workspace_id: string
  product_name: string | null
  product_description: string | null
  primary_audience: string | null
  tone_score: number | null
  avg_sentence_length: 'short' | 'medium' | 'long' | null
  emoji_usage: 'none' | 'minimal' | 'moderate' | 'heavy' | null
  hook_style_preferences: string[] | null
  signature_phrases: string[] | null
  avoid_phrases: string[] | null
  cta_style: 'soft' | 'direct' | 'question' | null
  brand_voice_keywords: string[] | null
  questionnaire_answers: Json | null
  sample_posts_raw: string | null
  website_url: string | null
  created_at: string
  updated_at: string
}

export interface PostRow {
  id: string
  workspace_id: string
  author_id: string
  content: string
  status: PostStatus
  post_format: string | null
  tone: string | null
  length_preference: string | null
  hook_style: string | null
  hashtags: string[] | null
  char_count: number | null
  voice_match_score: number | null
  scheduled_at: string | null
  published_at: string | null
  linkedin_post_id: string | null
  publish_attempts: number
  source_content: string | null
  generation_topic: string | null
  created_at: string
  updated_at: string
}

export interface PostVersionRow {
  id: string
  post_id: string
  content: string
  edited_by: string
  created_at: string
}

export interface PostCommentRow {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
}

export interface UsageTrackingRow {
  id: string
  user_id: string
  workspace_id: string
  month_year: string
  posts_generated: number
  created_at: string
  updated_at: string
}

// ---- Insert types ----
export type WorkspaceInsert = Omit<WorkspaceRow, 'id' | 'created_at' | 'updated_at'>
export type UserInsert = Omit<UserRow, 'id' | 'created_at' | 'updated_at'>
export type BrandProfileInsert = Omit<BrandProfileRow, 'id' | 'created_at' | 'updated_at'>
export type PostInsert = Omit<PostRow, 'id' | 'created_at' | 'updated_at'>
export type PostVersionInsert = Omit<PostVersionRow, 'id' | 'created_at'>
export type PostCommentInsert = Omit<PostCommentRow, 'id' | 'created_at'>
export type UsageTrackingInsert = Omit<UsageTrackingRow, 'id' | 'created_at' | 'updated_at'>

// ---- Update types ----
export type WorkspaceUpdate = Partial<WorkspaceInsert>
export type UserUpdate = Partial<UserInsert>
export type BrandProfileUpdate = Partial<BrandProfileInsert>
export type PostUpdate = Partial<PostInsert>
export type PostVersionUpdate = Partial<PostVersionInsert>
export type PostCommentUpdate = Partial<PostCommentInsert>
export type UsageTrackingUpdate = Partial<UsageTrackingInsert>

export interface Database {
  public: {
    Views: Record<never, never>
    Functions: Record<never, never>
    Tables: {
      workspaces: {
        Row: WorkspaceRow
        Insert: WorkspaceInsert
        Update: WorkspaceUpdate
        Relationships: []
      }
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
        Relationships: []
      }
      brand_profiles: {
        Row: BrandProfileRow
        Insert: BrandProfileInsert
        Update: BrandProfileUpdate
        Relationships: []
      }
      posts: {
        Row: PostRow
        Insert: PostInsert
        Update: PostUpdate
        Relationships: []
      }
      post_versions: {
        Row: PostVersionRow
        Insert: PostVersionInsert
        Update: PostVersionUpdate
        Relationships: []
      }
      post_comments: {
        Row: PostCommentRow
        Insert: PostCommentInsert
        Update: PostCommentUpdate
        Relationships: []
      }
      usage_tracking: {
        Row: UsageTrackingRow
        Insert: UsageTrackingInsert
        Update: UsageTrackingUpdate
        Relationships: []
      }
    }
  }
}

// Convenience aliases
export type Workspace = WorkspaceRow
export type User = UserRow
export type BrandProfile = BrandProfileRow
export type Post = PostRow
export type PostVersion = PostVersionRow
export type PostComment = PostCommentRow
export type UsageTracking = UsageTrackingRow
