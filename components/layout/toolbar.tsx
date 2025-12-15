/**
 * File: toolbar.tsx
 * Path: /components/layout/toolbar.tsx
 * Last Modified: 2025-12-09
 * Description: Toolbar con botón para generar reportes
 */

"use client"

import { Upload, FileText, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ToolbarProps {
  onFileUpload: (file: File) => void
  activeTab: "overview" | "social" | "web"
  onTabChange: (tab: "overview" | "social" | "web") => void
  platform: string
  onPlatformChange: (platform: string) => void
  dateRange: string
  onDateRangeChange: (range: string) => void
  uploadedFiles: string[]
}

export function Toolbar({
  onFileUpload,
  activeTab,
  onTabChange,
  platform,
  onPlatformChange,
  dateRange,
  onDateRangeChange,
  uploadedFiles,
}: ToolbarProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const platforms = ["All", "LinkedIn", "X"]
  const hasPlatforms = uploadedFiles.length > 0
  const showPlatformPicker = activeTab !== "web" && hasPlatforms

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "social", label: "Social" },
    { id: "web", label: "Web" },
  ]

  const handleUploadClick = () => {
    router.push("/upload")
  }

  const handleGenerateReport = () => {
    router.push("/reports")
  }

  const handleClearData = () => {
    if (showConfirm) {
      localStorage.removeItem("condor_analytics_data")
      localStorage.removeItem("condor_uploaded_files")
      setShowConfirm(false)
      router.refresh()
      window.location.href = "/"
    } else {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  return (
    <div className="bg-background border-b border-border px-8 py-4">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as "overview" | "social" | "web")}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  activeTab === tab.id
                    ? "bg-foreground text-background"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-foreground hover:bg-accent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
            </select>

            {showPlatformPicker && (
              <div className="flex items-center gap-2">
                {platforms.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => onPlatformChange(plat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      platform === plat
                        ? "bg-foreground text-background"
                        : "bg-card border border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            
            {hasPlatforms && (
              <button
                onClick={handleGenerateReport}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
              >
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
            )}

            {hasPlatforms && (
              <button
                onClick={handleClearData}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  showConfirm
                    ? "bg-red-500 text-white"
                    : "bg-card border border-red-500/50 text-red-500 hover:bg-red-500/10"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {showConfirm ? "Click again to confirm" : "Clear Data"}
              </button>
            )}
          </div>

          <div className="flex justify-end">
            {uploadedFiles.length > 0 ? (
              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="font-medium">{uploadedFiles.length} file(s) uploaded</span>
                <div className="group relative cursor-help inline-block">
                  <span className="text-neutral-500">ⓘ</span>
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-card border border-border rounded-lg p-2 text-xs text-foreground whitespace-nowrap z-50 shadow-lg">
                    {uploadedFiles.join(", ")}
                  </div>
                </div>
                <button onClick={handleUploadClick} className="text-primary hover:underline">
                  Upload more files
                </button>
              </div>
            ) : (
              <button
                onClick={handleUploadClick}
                className="text-xs text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors"
              >
                <span className="font-medium">No files uploaded yet</span>
                <span className="mx-1">•</span>
                <span className="underline">Click here to upload</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}