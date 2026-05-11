/**
 * File: useContentItems.ts
 * Path: /lib/hooks/useContentItems.ts
 * Description: Hook for fetching the content item list with optional filters.
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchContentItems, fetchCurrentUserWorkspaceId, type ContentItemFilters } from "@/lib/content/queries"
import type { ContentItem } from "@/lib/content/types"

interface UseContentItemsReturn {
  items: ContentItem[]
  workspaceId: string | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useContentItems(filters: ContentItemFilters = {}): UseContentItemsReturn {
  const [items, setItems] = useState<ContentItem[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const wsId = await fetchCurrentUserWorkspaceId()
        if (!wsId || cancelled) return
        setWorkspaceId(wsId)

        const data = await fetchContentItems(wsId, filters)
        if (!cancelled) setItems(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load content items")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, filters.status, filters.platform, filters.search])

  return { items, workspaceId, isLoading, error, refetch }
}
