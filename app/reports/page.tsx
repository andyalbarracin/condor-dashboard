"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col ml-20 lg:ml-64 transition-all duration-300">
        <Header accountName="Asentria" />
        <div className="flex-1 overflow-auto">
          <div className="px-8 py-8">
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <h1 className="text-3xl font-bold mb-4">Reports</h1>
              <p className="text-neutral-500">
                Coming soon... Generate and download PDF reports of your analytics data.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}
