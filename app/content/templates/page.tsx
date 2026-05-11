/**
 * File: page.tsx
 * Path: /app/content/templates/page.tsx
 * Description: Content Deck — Templates placeholder (future feature).
 */

"use client"

import { useState } from "react"
import { BookMarked, Sparkles } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import { ContentNavbar } from "@/components/content/content-navbar"

const TEMPLATE_PREVIEWS = [
  {
    name: "LinkedIn Thought Leadership",
    type: "Post",
    platform: "LinkedIn",
    description: "Hook → Problem → Insight → CTA. Proven format for B2B thought leadership.",
  },
  {
    name: "X Thread Breakdown",
    type: "Thread",
    platform: "X",
    description: "Numbered breakdown of a complex topic. Each tweet builds on the last.",
  },
  {
    name: "Case Study Post",
    type: "Article",
    platform: "LinkedIn",
    description: "Challenge → Solution → Result. Data-backed success story format.",
  },
  {
    name: "Newsletter Intro",
    type: "Newsletter",
    platform: "Email",
    description: "Greeting → Week's highlight → Main value → CTA. Consistent newsletter structure.",
  },
]

export default function ContentTemplatesPage() {
  const [sidebarOpen, setSidebarOpen] = useSidebarState()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <Header />
        <main className="flex-1 p-6">
          <ContentNavbar onNewItem={() => {}} />

          {/* Coming soon banner */}
          <div className="mb-6 flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 border border-border rounded-xl">
            <Sparkles className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Templates — coming soon</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Save winning content formats as reusable templates. AI will generate templates based on your best-performing posts.
              </p>
            </div>
          </div>

          {/* Preview cards */}
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
              Example templates (preview)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATE_PREVIEWS.map((t) => (
                <div
                  key={t.name}
                  className="bg-card border border-border rounded-xl p-4 opacity-60 cursor-not-allowed select-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                      <BookMarked className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {t.type} · {t.platform}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1.5">{t.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
