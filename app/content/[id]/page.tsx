/**
 * File: page.tsx
 * Path: /app/content/[id]/page.tsx
 * Description: Content Deck — Detail page for a single content item.
 */

"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import { ContentItemDetail } from "@/components/content/content-item-detail"
import { useContentItem } from "@/lib/hooks/useContentItem"
import { createClient } from "@/lib/supabase/client"

export default function ContentDetailPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""

  const [sidebarOpen, setSidebarOpen] = useSidebarState()
  const [userId, setUserId] = useState<string | null>(null)

  const { item, versions, comments, activity, attachments, isLoading, error, refetch } =
    useContentItem(id)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 flex items-center justify-center min-w-0 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 flex items-center justify-center min-w-0 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">Content item not found</p>
            <p className="text-sm text-neutral-500">{error ?? "This item may have been deleted."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <ContentItemDetail
          item={item}
          versions={versions}
          comments={comments}
          activity={activity}
          attachments={attachments}
          userId={userId ?? ""}
          onRefetch={refetch}
        />
      </div>
    </div>
  )
}
