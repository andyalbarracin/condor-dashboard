/**
 * File: page.tsx
 * Path: /app/page.tsx
 * Last Modified: 2025-12-06
 * Description: Página principal con filtro de fecha funcional
 */

"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useSearchParams } from "next/navigation"
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

/**
 * Filtra datos por rango de fecha
 */
function filterByDateRange(data: ParsedDataset, dateRange: string): ParsedDataset {
  const now = new Date()
  let startDate = new Date()

  switch (dateRange) {
    case "1 week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "2 weeks":
      startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      break
    case "1 month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "3 months":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case "6 months":
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      break
    case "1 year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      // Si no reconoce el rango, devuelve todo
      return data
  }

  const filteredDataPoints = data.dataPoints.filter(point => {
    const pointDate = new Date(point.date)
    return pointDate >= startDate && pointDate <= now
  })

  if (filteredDataPoints.length === 0) {
    return data // Devolver data original si el filtro no deja nada
  }

  return {
    ...data,
    dataPoints: filteredDataPoints,
    dateRange: {
      start: filteredDataPoints[0].date,
      end: filteredDataPoints[filteredDataPoints.length - 1].date,
    },
  }
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [hasData, setHasData] = useState(false)
  const [rawData, setRawData] = useState<ParsedDataset | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "social" | "web">("overview")
  const [platform, setPlatform] = useState("All")
  const [dateRange, setDateRange] = useState("1 month")
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Sincronizar tab con URL query params
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && ["overview", "social", "web"].includes(tabParam)) {
      setActiveTab(tabParam as "overview" | "social" | "web")
    }
  }, [searchParams])

  // Cargar datos al montar
  useEffect(() => {
    const stored = localStorage.getItem("condor_analytics_data")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRawData(parsed)
        setHasData(true)
      } catch (error) {
        console.error("Failed to load stored data:", error)
      }
    }

    const files = localStorage.getItem("condor_uploaded_files")
    if (files) {
      try {
        setUploadedFiles(JSON.parse(files))
      } catch (error) {
        console.error("Failed to load file list:", error)
      }
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    try {
      const newFiles = [...uploadedFiles, file.name]
      setUploadedFiles(newFiles)
      localStorage.setItem("condor_uploaded_files", JSON.stringify(newFiles))
      console.log("File uploaded:", file.name)
    } catch (error) {
      console.error("Failed to upload file:", error)
    }
  }

  // Aplicar filtro de fecha a los datos
  const filteredData = rawData ? filterByDateRange(rawData, dateRange) : null

  // Blank state cuando no hay datos
  if (!hasData || !rawData) {
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
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-8 min-h-full">
              <BlankState />
            </div>
          </div>
          <Footer />
        </main>
      </div>
    )
  }

  // Dashboard con datos
  return (
    <PlatformContext.Provider value={{ platform, setPlatform }}>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className="flex-1 flex flex-col transition-all duration-300"
          style={{
            marginLeft: sidebarOpen ? "16rem" : "5rem",
            width: sidebarOpen ? "calc(100vw - 16rem)" : "calc(100vw - 5rem)",
          }}
        >
          <div className="sticky top-0 z-30 bg-background">
            <Header accountName="Asentria" />
          </div>

          <div className="sticky top-16 z-20 bg-background">
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
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ height: "calc(100vh - 13rem)" }}>
            <div className="px-8 py-8 min-h-full">
              {activeTab === "overview" && filteredData && (
                <OverviewTab data={filteredData} platform={platform} dateRange={dateRange} />
              )}
              {activeTab === "social" && filteredData && (
                <SocialTab data={filteredData} platform={platform} />
              )}
              {activeTab === "web" && <WebTab />}
            </div>
          </div>

          <div className="sticky bottom-0 z-10 bg-background">
            <Footer />
          </div>
        </main>
      </div>
    </PlatformContext.Provider>
  )
}