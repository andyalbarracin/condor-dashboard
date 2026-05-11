/**
 * File: page.tsx
 * Path: /app/content/pipeline/page.tsx
 * Description: Content Deck — Kanban pipeline view with drag & drop.
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import { ContentNavbar } from "@/components/content/content-navbar"
import { ContentKanbanView } from "@/components/content/content-kanban-view"
import { ContentEmptyState } from "@/components/content/content-empty-state"
import { ContentItemForm } from "@/components/content/content-item-form"
import { ContentItemEditForm } from "@/components/content/content-item-edit-form"
import { ContentFilters } from "@/components/content/content-filters"
import { useContentItems } from "@/lib/hooks/useContentItems"
import { useContentStatuses } from "@/lib/hooks/useContentStatuses"
import { updateContentItem, deleteContentItem, createContentItem } from "@/lib/content/mutations"
import type {
  ContentStatus, ContentPlatform, CreateContentItemPayload, ContentItem,
} from "@/lib/content/types"

// Skeleton loader for Kanban columns
function KanbanSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-64 xl:w-72 rounded-xl border border-border bg-neutral-50/60 dark:bg-neutral-900/40 animate-pulse">
          <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-20" />
          </div>
          <div className="p-2 space-y-2">
            {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((_, j) => (
              <div key={j} className="bg-card border border-border rounded-lg p-3 space-y-2">
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
                <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-16 mt-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ContentPipelinePage() {
  const [sidebarOpen, setSidebarOpen] = useSidebarState()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("")
  const [platformFilter, setPlatformFilter] = useState<ContentPlatform | "">("")

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [defaultFormStatus, setDefaultFormStatus] = useState<ContentStatus>("idea")
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)

  const [userId, setUserId] = useState<string | null>(null)
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const { items, workspaceId, isLoading, error, refetch } = useContentItems({
    status: statusFilter || undefined,
    platform: platformFilter || undefined,
    search: search || undefined,
  })

  const { getStatusName, updateStatusName } = useContentStatuses(workspaceId)

  const handleStatusChange = async (id: string, status: ContentStatus) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    try {
      await updateContentItem(id, { status }, userId, item)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content item?")) return
    try {
      await deleteContentItem(id)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleNewItem = (status: ContentStatus = "idea") => {
    setDefaultFormStatus(status)
    setShowCreateForm(true)
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

        <main className="flex-1 p-6 min-w-0 overflow-hidden">
          <ContentNavbar onNewItem={() => handleNewItem()} />

          <div className="mb-4">
            <ContentFilters
              search={search}
              onSearchChange={setSearch}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              platform={platformFilter}
              onPlatformChange={setPlatformFilter}
            />
          </div>

          {isLoading ? (
            <KanbanSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : items.length === 0 && !statusFilter && !platformFilter && !search ? (
            <ContentEmptyState
              action={
                <button
                  onClick={() => handleNewItem()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Create your first content item
                </button>
              }
            />
          ) : (
            <ContentKanbanView
              items={items}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={setEditingItem}
              onNewItem={handleNewItem}
              getStatusName={getStatusName}
              onRenameStatus={updateStatusName}
            />
          )}
        </main>
      </div>

      {/* Create form */}
      {workspaceId && userId && (
        <ContentItemForm
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreate}
          workspaceId={workspaceId}
          userId={userId}
          defaultStatus={defaultFormStatus}
        />
      )}

      {/* Edit form */}
      {editingItem && (
        <ContentItemEditForm
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={refetch}
          item={editingItem}
          userId={userId}
        />
      )}
    </div>
  )
}
