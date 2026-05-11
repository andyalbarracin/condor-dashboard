"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { BoardUpdate } from "@/lib/content-deck/types"

interface UseContentUpdatesReturn {
  updates: BoardUpdate[]
  isLoading: boolean
  addUpdate: (body: string, authorId: string, authorName?: string) => Promise<void>
  refetch: () => void
}

export function useContentUpdates(itemId: string | null): UseContentUpdatesReturn {
  const [updates, setUpdates] = useState<BoardUpdate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!itemId) { setUpdates([]); return }
    let cancelled = false
    setIsLoading(true)

    const load = async () => {
      try {
        const supabase = createClient()
        // Try content_board_updates first, fall back to content_comments
        const { data, error } = await supabase
          .from("content_board_updates")
          .select("*")
          .eq("item_id", itemId)
          .order("created_at", { ascending: false })

        if (!error && data && !cancelled) {
          setUpdates(data as BoardUpdate[])
          setIsLoading(false)
          return
        }

        // Fallback: use existing content_comments table
        const { data: comments } = await supabase
          .from("content_comments")
          .select("*, profile:profiles(full_name, avatar_url)")
          .eq("content_item_id", itemId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })

        if (!cancelled) {
          const mapped: BoardUpdate[] = (comments ?? []).map((c: {
            id: string; content_item_id: string; user_id: string;
            body: string; created_at: string; updated_at: string | null;
            profile?: { full_name: string | null; avatar_url: string | null }
          }) => ({
            id: c.id,
            item_id: c.content_item_id,
            author_id: c.user_id,
            body: c.body,
            update_type: "comment",
            created_at: c.created_at,
            updated_at: c.updated_at ?? c.created_at,
            author_name: c.profile?.full_name ?? null,
            author_avatar: c.profile?.avatar_url ?? null,
          }))
          setUpdates(mapped)
          setIsLoading(false)
        }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [itemId, tick])

  const addUpdate = useCallback(async (body: string, authorId: string, authorName?: string) => {
    if (!itemId) return

    const optimistic: BoardUpdate = {
      id: `upd-${Date.now()}`,
      item_id: itemId,
      author_id: authorId,
      body,
      update_type: "comment",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_name: authorName ?? null,
      author_avatar: null,
    }
    setUpdates(prev => [optimistic, ...prev])

    try {
      const supabase = createClient()
      // Try content_board_updates first
      const { error } = await supabase.from("content_board_updates").insert({
        item_id: itemId,
        author_id: authorId,
        body,
        update_type: "comment",
      })

      if (error) {
        // Fallback to content_comments
        await supabase.from("content_comments").insert({
          content_item_id: itemId,
          user_id: authorId,
          body,
        })
      }
    } catch (err) {
      console.error("addUpdate failed", err)
    }
  }, [itemId])

  return { updates, isLoading, addUpdate, refetch }
}
