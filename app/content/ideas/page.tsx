/**
 * File: page.tsx
 * Path: /app/content/ideas/page.tsx
 * Description: Content Deck — Ideas board (status = "idea").
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Sparkles, Plus } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import { ContentNavbar } from "@/components/content/content-navbar"
import { ContentItemForm } from "@/components/content/content-item-form"
import { ContentStatusBadge } from "@/components/content/content-status-badge"
import { ContentPlatformBadges } from "@/components/content/content-platform-badges"
import { useContentItems } from "@/lib/hooks/useContentItems"
import { deleteContentItem, createContentItem } from "@/lib/content/mutations"
import type { CreateContentItemPayload } from "@/lib/content/types"

export default function ContentIdeasPage() {
  const [sidebarOpen, setSidebarOpen] = useSidebarState()
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const { items, workspaceId, isLoading, error, refetch } = useContentItems({ status: "idea" })

  const [userId, setUserId] = useState<string | null>(null)
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const handleCreate = async (payload: CreateContentItemPayload) => {
    await createContentItem(payload)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this idea?")) return
    try {
      await deleteContentItem(id)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <Header />
        <main className="flex-1 p-6">
          <ContentNavbar onNewItem={() => setShowForm(true)} />

          {/* AI placeholder banner */}
          <div className="mb-6 flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 border border-border rounded-xl">
            <Sparkles className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">AI idea generation — coming soon</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Generate content ideas from your top-performing posts and analytics insights. For now, capture your ideas manually.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* New idea card */}
              <button
                onClick={() => setShowForm(true)}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all text-neutral-400 hover:text-primary"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">New Idea</span>
              </button>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
                  onClick={() => router.push(`/content/${item.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <ContentStatusBadge status={item.status} size="sm" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                      className="opacity-0 group-hover:opacity-100 text-xs text-neutral-400 hover:text-red-500 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug mb-2">
                    {item.title}
                  </p>
                  {item.platforms.length > 0 && (
                    <ContentPlatformBadges platforms={item.platforms} max={2} />
                  )}
                  <p className="text-[10px] text-neutral-400 mt-3">
                    {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
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
          defaultStatus="idea"
        />
      )}
    </div>
  )
}
