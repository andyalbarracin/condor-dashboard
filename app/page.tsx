"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Toolbar } from "@/components/layout/toolbar"
import { Footer } from "@/components/layout/footer"
import { BlankState } from "@/components/dashboard/blank-state"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { SocialTab } from "@/components/dashboard/social-tab"
import { WebTab } from "@/components/dashboard/web-tab"
import type { ParsedDataset } from "@/lib/parsers/types"

const PlatformContext = createContext<{
  platform: string
  setPlatform: (p: string) => void
}>({
  platform: "All",
  setPlatform: () => {},
})

export function usePlatform() {
  return useContext(PlatformContext)
}

export default function DashboardPage() {
  const [hasData, setHasData] = useState(false)
  const [data, setData] = useState<ParsedDataset | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "social" | "web">("overview")
  const [platform, setPlatform] = useState("All")
  const [dateRange, setDateRange] = useState("1 month")
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("condor_analytics_data")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setData(parsed)
        setHasData(true)
      } catch (error) {
        console.error("Failed to load stored data")
      }
    }

    const files = localStorage.getItem("condor_uploaded_files")
    if (files) {
      try {
        setUploadedFiles(JSON.parse(files))
      } catch (error) {
        console.error("Failed to load file list")
      }
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    try {
      const newFiles = [...uploadedFiles, file.name]
      setUploadedFiles(newFiles)
      localStorage.setItem("condor_uploaded_files", JSON.stringify(newFiles))
    } catch (error) {
      console.error("Failed to upload file:", error)
    }
  }

  if (!hasData || !data) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col ml-20 lg:ml-64 transition-all duration-300">
          <Header accountName="Asentria" />
          <div className="flex-1 overflow-y-auto" style={{ height: "calc(100vh - 200px)" }}>
            <div className="px-8 py-8 min-h-full">
              <BlankState />
            </div>
          </div>
          <Footer />
        </main>
      </div>
    )
  }

  return (
    <PlatformContext.Provider value={{ platform, setPlatform }}>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col ml-20 lg:ml-64 transition-all duration-300">
          <Header accountName="Asentria" />
          <Toolbar
            onFileUpload={handleFileUpload}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            platform={platform}
            onPlatformChange={setPlatform}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            uploadedFiles={uploadedFiles}
          />
          <div className="flex-1 overflow-y-auto" style={{ height: "calc(100vh - 280px)" }}>
            <div className="px-8 py-8 min-h-full">
              {activeTab === "overview" && <OverviewTab data={data} platform={platform} dateRange={dateRange} />}
              {activeTab === "social" && <SocialTab data={data} platform={platform} />}
              {activeTab === "web" && <WebTab />}
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </PlatformContext.Provider>
  )
}
