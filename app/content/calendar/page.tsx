/**
 * File: page.tsx
 * Path: /app/content/calendar/page.tsx
 * Description: Content Deck — Calendar view (items grouped by date).
 */

"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import { ContentNavbar } from "@/components/content/content-navbar"
import { ContentCalendarView } from "@/components/content/content-calendar-view"
import { ContentEmptyState } from "@/components/content/content-empty-state"
import { ContentItemForm } from "@/components/content/content-item-form"
import { useContentItems } from "@/lib/hooks/useContentItems"
import { createContentItem } from "@/lib/content/mutations"
import type { CreateContentItemPayload } from "@/lib/content/types"

export default function ContentCalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useSidebarState()
  const [showForm, setShowForm] = useState(false)

  const { items, workspaceId, isLoading, error, refetch } = useContentItems()

  const [userId, setUserId] = useState<string | null>(null)
  if (!userId) {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }

  const handleCreate = async (payload: CreateContentItemPayload) => {
    await createContentItem(payload)
    refetch()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <Header />
        <main className="flex-1 p-6 min-w-0">
          <ContentNavbar onNewItem={() => setShowForm(true)} />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <ContentEmptyState
              title="No items in calendar"
              description="Create content items with a scheduled date, due date, or published date to see them here."
              action={
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Create content item
                </button>
              }
            />
          ) : (
            <ContentCalendarView items={items} />
          )}
        </main>
      </div>

      {workspaceId && userId && (
        <ContentItemForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
          workspaceId={workspaceId}
          userId={userId}
          defaultStatus="scheduled"
        />
      )}
    </div>
  )
}
