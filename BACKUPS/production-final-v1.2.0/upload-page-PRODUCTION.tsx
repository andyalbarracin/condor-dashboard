/**
 * File: page.tsx
 * Path: /app/upload/page.tsx
 * Last Modified: 2026-01-20
 * Description: Upload page con sidebar persistente entre páginas
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MiniDropZone } from "@/components/upload/mini-drop-zone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataPreview } from "@/components/dashboard/data-preview"
import { parseFile } from "@/lib/parsers/universal-parser"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import type { ParsedDataset } from "@/lib/parsers/types"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedDataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useSidebarState()  // ← CAMBIO: hook global
  const router = useRouter()

  const handleFileSelect = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setParsedData(null)

    try {
      const result = await parseFile(file)

      if (!result.success || !result.data) {
        setError(result.error || "Failed to parse file")
        return
      }

      setParsedData(result.data)
      
      const existingFiles = JSON.parse(localStorage.getItem("condor_uploaded_files") || "[]")
      const newFiles = [...existingFiles, file.name]
      localStorage.setItem("condor_uploaded_files", JSON.stringify(newFiles))
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred while parsing the file"
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveData = () => {
    if (!parsedData) return
    
    try {
      const existingDataStr = localStorage.getItem("condor_analytics_data")
      let existingData: ParsedDataset | null = null
      
      if (existingDataStr) {
        try {
          existingData = JSON.parse(existingDataStr)
        } catch (error) {
          existingData = null
        }
      }
      
      if (existingData && existingData.dataPoints) {
        const mergedDataPoints = [...existingData.dataPoints, ...parsedData.dataPoints]
        
        const uniqueDataPoints = mergedDataPoints.filter((point, index, self) => 
          index === self.findIndex(p => p.date === point.date && p.source === point.source)
        )
        
        uniqueDataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        const mergedData: ParsedDataset = {
          source: parsedData.source,
          dataPoints: uniqueDataPoints,
          rawHeaders: [...existingData.rawHeaders, ...parsedData.rawHeaders],
          normalizedHeaders: { ...existingData.normalizedHeaders, ...parsedData.normalizedHeaders },
          dateRange: {
            start: uniqueDataPoints[0].date,
            end: uniqueDataPoints[uniqueDataPoints.length - 1].date,
          },
          metadata: {
            ...existingData.metadata,
            ...parsedData.metadata,
          }
        }
        
        localStorage.setItem("condor_analytics_data", JSON.stringify(mergedData))
      } else {
        localStorage.setItem("condor_analytics_data", JSON.stringify(parsedData))
      }
      
      setTimeout(() => {
        router.push("/")
      }, 500)
      
    } catch (error) {
      setError('Error saving data to localStorage')
    }
  }

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
          <div className="px-8 py-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Upload Analytics</h1>
              <p className="text-neutral-500 mt-1">Import your data from LinkedIn, X, Google Analytics, or other platforms</p>
            </div>

            {error && (
              <Card className="mb-6 border-red-500/50 bg-red-500/5">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-500">Error parsing file</p>
                      <p className="text-sm text-red-400 mt-1">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!parsedData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Upload File</CardTitle>
                  <CardDescription>CSV or XLSX format from LinkedIn, X, Google Analytics, Instagram, or TikTok</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <MiniDropZone onFileSelect={handleFileSelect} isLoading={isLoading} />

                  <div className="p-4 bg-background border border-border rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-3">Supported formats:</p>
                    <ul className="text-sm text-foreground space-y-1">
                      <li>• LinkedIn Content Analytics (XLS/XLSX with "Metrics" + "All posts" sheets)</li>
                      <li>• LinkedIn Followers Analytics (XLS/XLSX)</li>
                      <li>• LinkedIn Visitors Analytics (XLS/XLSX)</li>
                      <li>• X/Twitter Analytics Export (CSV with Post id, Date, Post text)</li>
                      <li>• Google Analytics 4 Traffic Acquisition (CSV export)</li>
                      <li>• Generic CSV files with date and engagement metrics</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="border-green-500/50 bg-green-500/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-3 items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-500">File parsed successfully!</p>
                        <p className="text-sm text-green-400 mt-1">
                          {parsedData.dataPoints.length} data points from {parsedData.source.toUpperCase()}
                          {parsedData.subType && ` (${parsedData.subType})`}
                          {' '}({parsedData.dateRange.start} to {parsedData.dateRange.end})
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <DataPreview data={parsedData} />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setParsedData(null)
                      setError(null)
                    }}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-card-hover transition-colors text-sm font-medium text-foreground"
                  >
                    Upload Another File
                  </button>
                  <button
                    onClick={handleSaveData}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}