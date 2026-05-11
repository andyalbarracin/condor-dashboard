/**
 * File: mutations.ts
 * Path: /lib/content/mutations.ts
 * Description: Supabase write mutations for the Content Deck module.
 */

import { createClient } from "@/lib/supabase/client"
import type {
  ContentItem,
  ContentVersion,
  ContentComment,
  ContentAttachment,
  CreateContentItemPayload,
  UpdateContentItemPayload,
  CreateContentVersionPayload,
  CreateCommentPayload,
  CreateAttachmentPayload,
  ContentActivityEventType,
} from "./types"

// ── Content Items ─────────────────────────────────────────────

export async function createContentItem(
  payload: CreateContentItemPayload
): Promise<ContentItem> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_items")
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await logActivity({
    content_item_id: data.id,
    user_id: payload.created_by ?? null,
    event_type: "created",
    new_value: payload.title,
  })

  return data as ContentItem
}

export async function updateContentItem(
  id: string,
  payload: UpdateContentItemPayload,
  userId?: string | null,
  oldItem?: Partial<ContentItem>
): Promise<ContentItem> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_items")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  // Log relevant activity events
  if (payload.status && oldItem?.status && payload.status !== oldItem.status) {
    await logActivity({
      content_item_id: id,
      user_id: userId ?? null,
      event_type: "status_changed",
      old_value: oldItem.status,
      new_value: payload.status,
    })
  }

  if (payload.title && oldItem?.title && payload.title !== oldItem.title) {
    await logActivity({
      content_item_id: id,
      user_id: userId ?? null,
      event_type: "title_updated",
      old_value: oldItem.title,
      new_value: payload.title,
    })
  }

  return data as ContentItem
}

export async function deleteContentItem(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("content_items").delete().eq("id", id)
  if (error) throw error
}

export async function archiveContentItem(id: string, userId?: string | null): Promise<ContentItem> {
  return updateContentItem(
    id,
    { status: "archived", archived_at: new Date().toISOString() },
    userId
  )
}

// ── Content Versions ──────────────────────────────────────────

export async function createContentVersion(
  payload: CreateContentVersionPayload
): Promise<ContentVersion> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_versions")
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  await logActivity({
    content_item_id: payload.content_item_id,
    user_id: payload.created_by ?? null,
    event_type: "version_created",
    new_value: payload.platform,
  })

  return data as ContentVersion
}

export async function updateContentVersion(
  id: string,
  payload: Partial<CreateContentVersionPayload>
): Promise<ContentVersion> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_versions")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as ContentVersion
}

export async function deleteContentVersion(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("content_versions").delete().eq("id", id)
  if (error) throw error
}

// ── Comments ──────────────────────────────────────────────────

export async function createComment(payload: CreateCommentPayload): Promise<ContentComment> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_comments")
    .insert(payload)
    .select("*, profile:profiles(full_name, avatar_url)")
    .single()

  if (error) throw error

  await logActivity({
    content_item_id: payload.content_item_id,
    user_id: payload.user_id,
    event_type: "comment_added",
  })

  return data as ContentComment
}

export async function deleteComment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("content_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw error
}

// ── Attachments ───────────────────────────────────────────────

export async function createAttachment(
  payload: CreateAttachmentPayload
): Promise<ContentAttachment> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_attachments")
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  await logActivity({
    content_item_id: payload.content_item_id,
    user_id: payload.created_by ?? null,
    event_type: "attachment_added",
    new_value: payload.file_name ?? payload.external_url ?? "attachment",
  })

  return data as ContentAttachment
}

export async function deleteAttachment(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("content_attachments").delete().eq("id", id)
  if (error) throw error
}

// ── Activity Logging ──────────────────────────────────────────

interface LogActivityPayload {
  content_item_id: string
  user_id: string | null
  event_type: ContentActivityEventType
  old_value?: string | null
  new_value?: string | null
  metadata?: Record<string, unknown>
}

async function logActivity(payload: LogActivityPayload): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from("content_activity").insert({
      content_item_id: payload.content_item_id,
      user_id: payload.user_id,
      event_type: payload.event_type,
      old_value: payload.old_value ?? null,
      new_value: payload.new_value ?? null,
      metadata: payload.metadata ?? {},
    })
  } catch {
    // Activity logging is non-critical — don't throw
  }
}
