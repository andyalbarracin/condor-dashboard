/**
 * File: types.ts
 * Path: /lib/content/types.ts
 * Description: TypeScript types for the Content Deck module.
 */

export type ContentStatus =
  | "idea"
  | "drafting"
  | "review"
  | "approved"
  | "scheduled"
  | "published"
  | "archived"

export type ContentPlatform =
  | "linkedin"
  | "x"
  | "instagram"
  | "tiktok"
  | "blog"
  | "email"
  | "youtube"
  | "custom"

export type ContentType =
  | "post"
  | "article"
  | "story"
  | "reel"
  | "video"
  | "newsletter"
  | "thread"
  | "carousel"
  | "other"

export type ContentActivityEventType =
  | "created"
  | "status_changed"
  | "title_updated"
  | "version_created"
  | "comment_added"
  | "assigned_author"
  | "assigned_reviewer"
  | "scheduled"
  | "published"
  | "archived"
  | "attachment_added"

export interface ContentItem {
  id: string
  workspace_id: string
  title: string
  slug: string | null
  status: ContentStatus
  content_type: ContentType | null
  campaign: string | null
  primary_platform: ContentPlatform | null
  platforms: ContentPlatform[]
  author_id: string | null
  reviewer_id: string | null
  due_date: string | null
  scheduled_at: string | null
  published_at: string | null
  external_url: string | null
  source: string | null
  linked_dataset_id: string | null
  linked_post_id: string | null
  performance_score: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface ContentVersion {
  id: string
  content_item_id: string
  platform: ContentPlatform
  headline: string | null
  body: string | null
  cta: string | null
  hashtags: string[]
  notes: string | null
  version_number: number
  is_primary: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ContentComment {
  id: string
  content_item_id: string
  user_id: string
  body: string
  mentioned_user_ids: string[]
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  profile?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export interface ContentAttachment {
  id: string
  content_item_id: string
  file_url: string | null
  file_name: string | null
  file_type: string | null
  storage_provider: string
  external_url: string | null
  created_by: string | null
  created_at: string
}

export interface ContentActivity {
  id: string
  content_item_id: string
  user_id: string | null
  event_type: ContentActivityEventType
  old_value: string | null
  new_value: string | null
  metadata: Record<string, unknown>
  created_at: string
  profile?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export interface ContentPerformanceLink {
  id: string
  content_item_id: string
  analytics_dataset_id: string | null
  platform_post_id: string | null
  platform: string | null
  matched_by: string
  performance_score: number | null
  metrics_snapshot: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ── Create/Update payloads ─────────────────────────────────────

export interface CreateContentItemPayload {
  workspace_id: string
  title: string
  status?: ContentStatus
  content_type?: ContentType | null
  campaign?: string | null
  primary_platform?: ContentPlatform | null
  platforms?: ContentPlatform[]
  author_id?: string | null
  reviewer_id?: string | null
  due_date?: string | null
  scheduled_at?: string | null
  external_url?: string | null
  created_by?: string | null
}

export interface UpdateContentItemPayload {
  title?: string
  status?: ContentStatus
  content_type?: ContentType | null
  campaign?: string | null
  primary_platform?: ContentPlatform | null
  platforms?: ContentPlatform[]
  author_id?: string | null
  reviewer_id?: string | null
  due_date?: string | null
  scheduled_at?: string | null
  published_at?: string | null
  external_url?: string | null
  linked_dataset_id?: string | null
  linked_post_id?: string | null
  performance_score?: number | null
  archived_at?: string | null
}

export interface CreateContentVersionPayload {
  content_item_id: string
  platform: ContentPlatform
  headline?: string | null
  body?: string | null
  cta?: string | null
  hashtags?: string[]
  notes?: string | null
  is_primary?: boolean
  created_by?: string | null
}

export interface CreateCommentPayload {
  content_item_id: string
  user_id: string
  body: string
  mentioned_user_ids?: string[]
}

export interface CreateAttachmentPayload {
  content_item_id: string
  file_url?: string | null
  file_name?: string | null
  file_type?: string | null
  external_url?: string | null
  created_by?: string | null
}

// ── UI helpers ─────────────────────────────────────────────────

export const CONTENT_STATUSES: ContentStatus[] = [
  "idea",
  "drafting",
  "review",
  "approved",
  "scheduled",
  "published",
  "archived",
]

export const STATUS_CONFIG: Record<
  ContentStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  idea:      { label: "Idea",      color: "text-neutral-500",      bg: "bg-neutral-100 dark:bg-neutral-800",      dot: "bg-neutral-400" },
  drafting:  { label: "Drafting",  color: "text-blue-600",         bg: "bg-blue-50 dark:bg-blue-900/30",          dot: "bg-blue-500" },
  review:    { label: "Review",    color: "text-amber-600",        bg: "bg-amber-50 dark:bg-amber-900/30",        dot: "bg-amber-500" },
  approved:  { label: "Approved",  color: "text-green-600",        bg: "bg-green-50 dark:bg-green-900/30",        dot: "bg-green-500" },
  scheduled: { label: "Scheduled", color: "text-violet-600",       bg: "bg-violet-50 dark:bg-violet-900/30",     dot: "bg-violet-500" },
  published: { label: "Published", color: "text-emerald-600",      bg: "bg-emerald-50 dark:bg-emerald-900/30",   dot: "bg-emerald-500" },
  archived:  { label: "Archived",  color: "text-neutral-400",      bg: "bg-neutral-50 dark:bg-neutral-900/30",   dot: "bg-neutral-300" },
}

export const PLATFORM_CONFIG: Record<ContentPlatform, { label: string; color: string }> = {
  linkedin:  { label: "LinkedIn",  color: "#0a66c2" },
  x:         { label: "X / Twitter", color: "#1da1f2" },
  instagram: { label: "Instagram", color: "#e1306c" },
  tiktok:    { label: "TikTok",    color: "#010101" },
  blog:      { label: "Blog",      color: "#6b7280" },
  email:     { label: "Email",     color: "#10b981" },
  youtube:   { label: "YouTube",   color: "#ef4444" },
  custom:    { label: "Custom",    color: "#8b5cf6" },
}

export const CONTENT_PLATFORMS: ContentPlatform[] = [
  "linkedin", "x", "instagram", "tiktok", "blog", "email", "youtube", "custom",
]

export const CONTENT_TYPES: ContentType[] = [
  "post", "article", "story", "reel", "video", "newsletter", "thread", "carousel", "other",
]

export const ACTIVITY_LABELS: Record<ContentActivityEventType, string> = {
  created:           "created this item",
  status_changed:    "changed status",
  title_updated:     "updated the title",
  version_created:   "added a content version",
  comment_added:     "left a comment",
  assigned_author:   "assigned an author",
  assigned_reviewer: "assigned a reviewer",
  scheduled:         "scheduled for publishing",
  published:         "marked as published",
  archived:          "archived this item",
  attachment_added:  "added an attachment",
}
