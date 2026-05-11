/**
 * File: queries.ts
 * Path: /lib/content/queries.ts
 * Description: Supabase read queries for the Content Deck module.
 */

import { createClient } from "@/lib/supabase/client"
import type {
  ContentItem,
  ContentVersion,
  ContentComment,
  ContentActivity,
  ContentAttachment,
  ContentPerformanceLink,
  ContentStatus,
  ContentPlatform,
} from "./types"

export interface ContentItemFilters {
  status?: ContentStatus | null
  platform?: ContentPlatform | null
  search?: string
}

export async function fetchContentItems(
  workspaceId: string,
  filters: ContentItemFilters = {}
): Promise<ContentItem[]> {
  const supabase = createClient()

  let query = supabase
    .from("content_items")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.platform) {
    query = query.contains("platforms", [filters.platform])
  }

  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return (data ?? []) as ContentItem[]
}

export async function fetchContentItem(id: string): Promise<ContentItem | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as ContentItem | null
}

export async function fetchContentVersions(contentItemId: string): Promise<ContentVersion[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_versions")
    .select("*")
    .eq("content_item_id", contentItemId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as ContentVersion[]
}

export async function fetchContentComments(contentItemId: string): Promise<ContentComment[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_comments")
    .select("*, profile:profiles(full_name, avatar_url)")
    .eq("content_item_id", contentItemId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data ?? []) as ContentComment[]
}

export async function fetchContentActivity(contentItemId: string): Promise<ContentActivity[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_activity")
    .select("*, profile:profiles(full_name, avatar_url)")
    .eq("content_item_id", contentItemId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as ContentActivity[]
}

export async function fetchContentAttachments(contentItemId: string): Promise<ContentAttachment[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_attachments")
    .select("*")
    .eq("content_item_id", contentItemId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as ContentAttachment[]
}

export async function fetchContentPerformanceLinks(
  contentItemId: string
): Promise<ContentPerformanceLink[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("content_performance_links")
    .select("*")
    .eq("content_item_id", contentItemId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as ContentPerformanceLink[]
}

// Module-level cache — avoids a round-trip on every page navigation
let _cachedWorkspaceId: string | null | undefined = undefined

export function clearWorkspaceIdCache() {
  _cachedWorkspaceId = undefined
}

export async function fetchCurrentUserWorkspaceId(): Promise<string | null> {
  if (_cachedWorkspaceId !== undefined) return _cachedWorkspaceId

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) { _cachedWorkspaceId = null; return null }

  const { data } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  _cachedWorkspaceId = data?.id ?? null
  return _cachedWorkspaceId as string | null
}
