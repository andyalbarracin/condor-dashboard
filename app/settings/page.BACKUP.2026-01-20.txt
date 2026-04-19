/**
 * File: page.tsx
 * Path: /app/settings/page.tsx
 * Last Modified: 2026-01-20
 * Description: Settings page con sidebar persistente entre páginas
 */

"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useSidebarState } from "@/lib/hooks/useSidebarState"

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useSidebarState()  // ← CAMBIO: hook global

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? "16rem" : "5rem",
          width: sidebarOpen ? "calc(100vw - 16rem)" : "calc(100vw - 5rem)",
        }}
      >
        <Header accountName="Asentria" />
        <div className="flex-1 overflow-auto">
          <div className="px-8 py-8">
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <h1 className="text-3xl font-bold mb-4">Settings</h1>
              <p className="text-neutral-500">Coming soon... Configure your account and integrations.</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}