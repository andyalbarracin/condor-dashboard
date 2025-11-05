"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MiniDropZone } from "@/components/upload/mini-drop-zone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataPreview } from "@/components/dashboard/data-preview"
import { parseCSV } from "@/lib/parsers/csv-parser"
import type { ParsedDataset } from "@/lib/parsers/types"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedDataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileSelect = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setParsedData(null)

    try {
      const text = await file.text()
      const result = await parseCSV(text)

      if (!result.success || !result.data) {
        setError(result.error || "Failed to parse CSV file")
        return
      }

      setParsedData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while parsing the file")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveData = () => {
    if (!parsedData) return
    localStorage.setItem("condor_analytics_data", JSON.stringify(parsedData))
    router.push("/")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden ml-20 lg:ml-64 transition-all duration-300">
        <Header accountName="Asentria" />
        <div className="flex-1 overflow-auto">
          <div className="px-8 py-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Upload Analytics</h1>
              <p className="text-neutral-500 mt-1">Import your data from LinkedIn, X, or other platforms</p>
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
                  <CardDescription>CSV or XLSX format from LinkedIn, X, Instagram, or TikTok</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <MiniDropZone onFileSelect={handleFileSelect} isLoading={isLoading} />

                  <div className="p-4 bg-background border border-border rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-3">Supported formats:</p>
                    <ul className="text-sm text-foreground space-y-1">
                      <li>LinkedIn analytics export (Followers, Content, Account Overview)</li>
                      <li>X/Twitter analytics export</li>
                      <li>CSV files with date and engagement metrics</li>
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
                          {parsedData.dataPoints.length} data points found from {parsedData.dateRange.start} to{" "}
                          {parsedData.dateRange.end}
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
      </main>
    </div>
  )
}
