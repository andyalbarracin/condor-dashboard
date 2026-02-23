/**
 * File: page.tsx
 * Path: /app/page.tsx
 * Last Modified: 2026-02-02
 * Description: Dashboard principal con multi-dataset support, date range y Weekly Summary
 */

"use client"

import { useState, useEffect, createContext, useContext, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Toolbar } from "@/components/layout/toolbar"
import { Footer } from "@/components/layout/footer"
import { BlankState } from "@/components/dashboard/blank-state"
import { OverviewTab } from "@/components/dashboard/overview-tab"
import { SocialTab } from "@/components/dashboard/social-tab"
import { WebTab } from "@/components/dashboard/web-tab"
import { WeeklySummaryButton } from "@/components/dashboard/weekly-summary-button"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import type { ParsedDataset } from "@/lib/parsers/types"
import { isMultiDataset, type MultiDataset } from "@/lib/parsers/types"
import { WeeklySummaryHeader } from "@/components/dashboard/weekly-summary-header" 

const PlatformContext = createContext<{
  platform: string
  setPlatform: (p: string) => void
}>({
  platform: "All",
  setPlatform: () => {},
})

function usePlatform() {
  return useContext(PlatformContext)
}

function filterByDateRange(data: ParsedDataset, dateRange: string): ParsedDataset {
  if (!data.dataPoints || data.dataPoints.length === 0) return data
  
  const dates = data.dataPoints.map(p => new Date(p.date).getTime())
  const mostRecentDate = new Date(Math.max(...dates))
  
  let startDate = new Date(mostRecentDate)

  switch (dateRange) {
    case "1 week":
      startDate.setDate(mostRecentDate.getDate() - 7)
      break
    case "2 weeks":
      startDate.setDate(mostRecentDate.getDate() - 14)
      break
    case "1 month":
      startDate.setDate(mostRecentDate.getDate() - 30)
      break
    case "3 months":
      startDate.setDate(mostRecentDate.getDate() - 90)
      break
    case "6 months":
      startDate.setDate(mostRecentDate.getDate() - 180)
      break
    case "1 year":
      startDate.setFullYear(mostRecentDate.getFullYear() - 1)
      break
    default:
      return data
  }

  const filteredDataPoints = data.dataPoints.filter(point => {
    const pointDate = new Date(point.date)
    return pointDate >= startDate && pointDate <= mostRecentDate
  })

  if (filteredDataPoints.length === 0) {
    return data
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

function SearchParamsHandler({
  activeTab,
  setActiveTab,
}: {
  activeTab: string
  setActiveTab: (tab: "overview" | "social" | "web") => void
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && ["overview", "social", "web"].includes(tabParam)) {
      setActiveTab(tabParam as "overview" | "social" | "web")
    } else if (!tabParam) {
      setActiveTab("overview")
    }
  }, [searchParams, setActiveTab])

  return null
}

function DashboardContent() {
  const router = useRouter()
  const [hasData, setHasData] = useState(false)
  const [allData, setAllData] = useState<ParsedDataset[]>([])
  const [followersData, setFollowersData] = useState<ParsedDataset | null>(null)
  const [visitorsData, setVisitorsData] = useState<ParsedDataset | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "social" | "web">("overview")
  const [platform, setPlatform] = useState("All")
  const [dateRange, setDateRange] = useState("1 month")
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useSidebarState()

  useEffect(() => {
    const stored = localStorage.getItem("condor_analytics_data")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        
        if (isMultiDataset(parsed)) {
          const multi = parsed as MultiDataset
          
          if (multi.content) {
            setAllData([multi.content])
            setHasData(true)
          }
          if (multi.followers) {
            setFollowersData(multi.followers)
          }
          if (multi.visitors) {
            setVisitorsData(multi.visitors)
          }
        } else {
          setAllData([parsed])
          setHasData(true)
        }
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
    } catch (error) {
      console.error("Failed to upload file:", error)
    }
  }

  const handleTabChange = (tab: "overview" | "social" | "web") => {
    setActiveTab(tab)
    if (tab === "overview") {
      router.push("/")
    } else {
      router.push(`/?tab=${tab}`)
    }
  }

  const socialData = allData.length > 0 
    ? {
        ...allData[0],
        dataPoints: allData[0].dataPoints.filter((p) => 
          p.source === 'linkedin' || p.source === 'twitter' || 
          p.source === 'instagram' || p.source === 'tiktok'
        )
      }
    : null

  const webData = allData.length > 0
    ? {
        ...allData[0],
        dataPoints: allData[0].dataPoints.filter((p) => p.source === 'google-analytics')
      }
    : null

  const filteredSocialData = socialData && socialData.dataPoints.length > 0 
    ? filterByDateRange(socialData, dateRange) 
    : null

  const cleanWebData = webData && webData.dataPoints.length > 0 ? webData : null

  if (!hasData || allData.length === 0) {
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

  return (
    <PlatformContext.Provider value={{ platform, setPlatform }}>
      <Suspense fallback={null}>
        <SearchParamsHandler activeTab={activeTab} setActiveTab={setActiveTab} />
      </Suspense>
      
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
              onTabChange={handleTabChange}
              platform={platform}
              onPlatformChange={setPlatform}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              uploadedFiles={uploadedFiles}
            />
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ height: "calc(100vh - 13rem)" }}>
            <div className="px-8 py-8 min-h-full">

              {activeTab === "overview" && filteredSocialData && (
                <OverviewTab
                  data={filteredSocialData}
                  platform={platform}
                  dateRange={dateRange}
                />
              )}

              {/* ⭐ SOCIAL TAB con Weekly Summary Button */}
              {activeTab === "social" && filteredSocialData && (
              <div className="space-y-6">
                <WeeklySummaryHeader data={filteredSocialData} userName="Andy" />
                  <SocialTab
                    data={filteredSocialData}
                    platform={platform}
                    dateRange={dateRange}
                    followersData={followersData}
                    visitorsData={visitorsData}
                  />
                </div>
              )}

              {activeTab === "web" && (
                <WebTab data={cleanWebData} />
              )}

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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}