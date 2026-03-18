/**
 * File: page.tsx
 * Path: /app/upload/page.tsx
 * Last Modified: 2026-03-18
 * Description: Upload page con multi-dataset support.
 *              FIX BUG #3: GA4 data now stored in google_analytics slot (not content).
 *              Previously, GA4 subTypes (utm_campaigns, traffic_sources) fell to default
 *              case in switch, overwriting content. Now checks source first.
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
import type { ParsedDataset, MultiDataset } from "@/lib/parsers/types"
import { isMultiDataset } from "@/lib/parsers/types"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedDataset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useSidebarState()
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
      // 1. Cargar datos existentes
      const existingStr = localStorage.getItem("condor_analytics_data")
      let multiData: MultiDataset = {}
      
      if (existingStr) {
        const existing = JSON.parse(existingStr)
        
        // Migración: Si es formato viejo (single dataset), convertir
        if (existing.dataPoints && !isMultiDataset(existing)) {
          multiData.content = existing as ParsedDataset
        } else {
          multiData = existing as MultiDataset
        }
      }
      
      // 2. Determinar dónde guardar el nuevo dataset
      // PRIMERO: Detectar por source (google-analytics va siempre a google_analytics)
      if (parsedData.source === 'google-analytics') {
        // GA4 data siempre va al slot google_analytics, sin importar subType
        if (multiData.google_analytics) {
          const mergedPoints = [...multiData.google_analytics.dataPoints, ...parsedData.dataPoints]
          const uniquePoints = mergedPoints.filter((point, index, self) => 
            index === self.findIndex(p => 
              p.id && point.id 
                ? p.id === point.id 
                : (p.date === point.date && p.source === point.source && JSON.stringify(p.metrics) === JSON.stringify(point.metrics))
            )
          )
          multiData.google_analytics = {
            ...parsedData,
            dataPoints: uniquePoints.sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )
          }
        } else {
          multiData.google_analytics = parsedData
        }
      } else {
        // SEGUNDO: Social media - usar subType
        const subType = parsedData.subType || 'content'
        
        switch (subType) {
          case 'content':
            if (multiData.content) {
              const mergedPoints = [...multiData.content.dataPoints, ...parsedData.dataPoints]
              const uniquePoints = mergedPoints.filter((point, index, self) => 
                index === self.findIndex(p => 
                  p.id && point.id 
                    ? p.id === point.id 
                    : (p.date === point.date && p.source === point.source && JSON.stringify(p.metrics) === JSON.stringify(point.metrics))
                )
              )
              multiData.content = {
                ...parsedData,
                dataPoints: uniquePoints.sort((a, b) => 
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                )
              }
            } else {
              multiData.content = parsedData
            }
            break
            
          case 'followers':
            if (multiData.followers) {
              const mergedPoints = [...multiData.followers.dataPoints, ...parsedData.dataPoints]
              const uniquePoints = mergedPoints.filter((point, index, self) => 
                index === self.findIndex(p => 
                  p.id && point.id 
                    ? p.id === point.id 
                    : (p.date === point.date && p.source === point.source && JSON.stringify(p.metrics) === JSON.stringify(point.metrics))
                )
              )
              multiData.followers = {
                ...parsedData,
                dataPoints: uniquePoints.sort((a, b) => 
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                )
              }
            } else {
              multiData.followers = parsedData
            }
            break
            
          case 'visitors':
            if (multiData.visitors) {
              const mergedPoints = [...multiData.visitors.dataPoints, ...parsedData.dataPoints]
              const uniquePoints = mergedPoints.filter((point, index, self) => 
                index === self.findIndex(p => 
                  p.id && point.id 
                    ? p.id === point.id 
                    : (p.date === point.date && p.source === point.source && JSON.stringify(p.metrics) === JSON.stringify(point.metrics))
                )
              )
              multiData.visitors = {
                ...parsedData,
                dataPoints: uniquePoints.sort((a, b) => 
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                )
              }
            } else {
              multiData.visitors = parsedData
            }
            break

          case 'account_overview':
            if (multiData.account_overview) {
              const mergedPoints = [...multiData.account_overview.dataPoints, ...parsedData.dataPoints]
              const uniquePoints = mergedPoints.filter((point, index, self) => 
                index === self.findIndex(p => 
                  p.id && point.id 
                    ? p.id === point.id 
                    : (p.date === point.date && p.source === point.source && JSON.stringify(p.metrics) === JSON.stringify(point.metrics))
                )
              )
              multiData.account_overview = {
                ...parsedData,
                dataPoints: uniquePoints.sort((a, b) => 
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                )
              }
            } else {
              multiData.account_overview = parsedData
            }
            break
            
          default:
            multiData.content = parsedData
        }
      }
      
      // 3. Actualizar metadata
      multiData.lastUpdated = new Date().toISOString()
      multiData.platforms = Array.from(new Set([
        ...(multiData.content?.dataPoints.map(p => p.source) || []),
        ...(multiData.followers?.dataPoints.map(p => p.source) || []),
        ...(multiData.visitors?.dataPoints.map(p => p.source) || []),
        ...(multiData.google_analytics?.dataPoints.map(p => p.source) || [])
      ]))
      
      console.log('✅ Data saved successfully:', {
        content: multiData.content?.dataPoints.length || 0,
        followers: multiData.followers?.dataPoints.length || 0,
        visitors: multiData.visitors?.dataPoints.length || 0,
        account_overview: multiData.account_overview?.dataPoints.length || 0,
        google_analytics: multiData.google_analytics?.dataPoints.length || 0,
        platforms: multiData.platforms
      })
      
      // 4. Guardar (preservando TODOS los datasets)
      localStorage.setItem("condor_analytics_data", JSON.stringify(multiData))
      
      // 5. Redirect
      setTimeout(() => {
        router.push("/")
      }, 500)
      
    } catch (error) {
      console.error('Error saving data:', error)
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