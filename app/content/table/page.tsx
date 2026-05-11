/**
 * File: page.tsx
 * Path: /app/content/table/page.tsx
 * Description: Content Deck — Table view.
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import { ContentNavbar } from "@/components/content/content-navbar"
import { ContentTableView } from "@/components/content/content-table-view"
import { ContentEmptyState } from "@/components/content/content-empty-state"
import { ContentItemForm } from "@/components/content/content-item-form"
import { ContentItemEditForm } from "@/components/content/content-item-edit-form"
import { ContentFilters } from "@/components/content/content-filters"
import { useContentItems } from "@/lib/hooks/useContentItems"
import { updateContentItem, deleteContentItem, createContentItem } from "@/lib/content/mutations"
import type {
  ContentStatus, ContentPlatform, CreateContentItemPayload, ContentItem,
} from "@/lib/content/types"

export default function ContentTablePage() {
  const [sidebarOpen, setSidebarOpen] = useSidebarState()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "">("")
  const [platformFilter, setPlatformFilter] = useState<ContentPlatform | "">("")
  const [showCreateForm, setShowCreateForm] = useState(false)
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
          <ContentNavbar onNewItem={() => setShowCreateForm(true)} />

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
            <div className="rounded-lg border border-border overflow-hidden animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-64" />
                  <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded w-16" />
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-24" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-20 ml-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : items.length === 0 && !statusFilter && !platformFilter && !search ? (
            <ContentEmptyState
              action={
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Create your first content item
                </button>
              }
            />
          ) : (
            <ContentTableView
              items={items}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={setEditingItem}
            />
          )}
        </main>
      </div>

      {workspaceId && userId && (
        <ContentItemForm
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreate}
          workspaceId={workspaceId}
          userId={userId}
        />
      )}

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
