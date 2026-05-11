"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { CONTENT_STATUSES, STATUS_CONFIG, type ContentStatus } from "@/lib/content/types"

export function useContentStatuses(workspaceId: string | null) {
  const [customNames, setCustomNames] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!workspaceId) return
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("content_statuses")
        .select("slug, name")
        .eq("workspace_id", workspaceId)
      if (data && data.length > 0) {
        const map: Record<string, string> = {}
        for (const s of data) map[s.slug] = s.name
        setCustomNames(map)
      }
    }
    load()
  }, [workspaceId])

  const getStatusName = useCallback(
    (slug: ContentStatus) => customNames[slug] ?? STATUS_CONFIG[slug]?.label ?? slug,
    [customNames]
  )

  const updateStatusName = useCallback(
    async (slug: ContentStatus, name: string) => {
      if (!workspaceId || !name.trim()) return
      const trimmed = name.trim()
      setCustomNames((prev) => ({ ...prev, [slug]: trimmed }))

      const supabase = createClient()
      const { data: existing } = await supabase
        .from("content_statuses")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("slug", slug)
        .maybeSingle()

      if (existing) {
        await supabase.from("content_statuses").update({ name: trimmed }).eq("id", existing.id)
      } else {
        await supabase.from("content_statuses").insert({
          workspace_id: workspaceId,
          slug,
          name: trimmed,
          order_index: CONTENT_STATUSES.indexOf(slug),
          is_default: false,
        })
      }
    },
    [workspaceId]
  )

  return { getStatusName, updateStatusName }
}
