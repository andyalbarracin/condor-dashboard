"use client"

import { Upload, FileDown } from "lucide-react"

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
  const platforms = ["All", "LinkedIn", "X"]
  const hasPlatforms = uploadedFiles.length > 0
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "social", label: "Social" },
    { id: "web", label: "Web" },
  ]

  return (
    <div className="bg-background border-b border-border px-8 py-4">
      <div className="grid grid-cols-2 gap-8">
        {/* Column 1: Tabs and Filters */}
        <div className="space-y-3">
          {/* Row 1: Tabs */}
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as "overview" | "social" | "web")}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  activeTab === tab.id
                    ? "bg-foreground text-background dark:bg-foreground dark:text-background"
                    : "text-neutral-600 dark:text-neutral-300 hover:text-foreground dark:hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Row 2: Date picker + Platform selector */}
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground dark:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="1 month">1 month</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
            </select>

            {hasPlatforms && (
              <div className="flex items-center gap-2">
                {platforms.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => onPlatformChange(plat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      platform === plat
                        ? "bg-foreground text-background dark:bg-foreground dark:text-background"
                        : "bg-card border border-border text-foreground dark:text-foreground hover:bg-accent dark:hover:bg-accent"
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Upload/Export and File counter */}
        <div className="space-y-3">
          {/* Row 1: Upload + Export buttons */}
          <div className="flex items-center justify-end gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background dark:bg-foreground dark:text-background rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground dark:text-foreground rounded-lg font-medium hover:bg-accent dark:hover:bg-accent transition-colors text-sm">
              <FileDown className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          {/* Row 2: File counter */}
          <div className="flex justify-end">
            {uploadedFiles.length > 0 ? (
              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="font-medium">{uploadedFiles.length} file uploaded</span>
                <div className="group relative cursor-help inline-block">
                  <span className="text-neutral-500 dark:text-neutral-400">ⓘ</span>
                  <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-card border border-border rounded-lg p-2 text-xs text-foreground dark:text-foreground whitespace-nowrap z-50 shadow-lg">
                    {uploadedFiles.join(", ")}
                  </div>
                </div>
                <span>More files? Just upload them here</span>
              </div>
            ) : (
              <span className="text-xs text-neutral-600 dark:text-neutral-300">
                <span className="font-medium">Drop files here</span>
                <span className="mx-1">ⓘ</span>
                <span>More files? Just upload them here</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
