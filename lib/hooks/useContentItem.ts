/**
 * File: useContentItem.ts
 * Path: /lib/hooks/useContentItem.ts
 * Description: Hook for fetching a single content item with all related data.
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import {
  fetchContentItem,
  fetchContentVersions,
  fetchContentComments,
  fetchContentActivity,
  fetchContentAttachments,
  fetchContentPerformanceLinks,
} from "@/lib/content/queries"
import type {
  ContentItem,
  ContentVersion,
  ContentComment,
  ContentActivity,
  ContentAttachment,
  ContentPerformanceLink,
} from "@/lib/content/types"

interface UseContentItemReturn {
  item: ContentItem | null
  versions: ContentVersion[]
  comments: ContentComment[]
  activity: ContentActivity[]
  attachments: ContentAttachment[]
  performanceLinks: ContentPerformanceLink[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useContentItem(id: string): UseContentItemReturn {
  const [item, setItem] = useState<ContentItem | null>(null)
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [comments, setComments] = useState<ContentComment[]>([])
  const [activity, setActivity] = useState<ContentActivity[]>([])
  const [attachments, setAttachments] = useState<ContentAttachment[]>([])
  const [performanceLinks, setPerformanceLinks] = useState<ContentPerformanceLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [itemData, versionsData, commentsData, activityData, attachmentsData, linksData] =
          await Promise.all([
            fetchContentItem(id),
            fetchContentVersions(id),
            fetchContentComments(id),
            fetchContentActivity(id),
            fetchContentAttachments(id),
            fetchContentPerformanceLinks(id),
          ])

        if (cancelled) return

        setItem(itemData)
        setVersions(versionsData)
        setComments(commentsData)
        setActivity(activityData)
        setAttachments(attachmentsData)
        setPerformanceLinks(linksData)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load content item")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id, tick])

  return { item, versions, comments, activity, attachments, performanceLinks, isLoading, error, refetch }
}
