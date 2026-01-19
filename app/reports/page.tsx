/**
 * File: page.tsx
 * Path: /app/reports/page.tsx
 * Last Modified: 2025-12-08
 * Description: Reports CORREGIDO - IDs únicos, grid responsive
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BenchmarkComparisonCard } from "@/components/reports/benchmark-comparison"
import { PDFExportButton } from "@/components/reports/pdf-export-button"
import { 
  generateAllComparisons, 
  generateRecommendations, 
  extractPlatformMetrics 
} from "@/lib/reports/benchmark-calculator"
import type { ParsedDataset } from "@/lib/parsers/types"
import { FileText, TrendingUp, Target, Award, ChevronUp, ChevronDown, HelpCircle } from "lucide-react"
import { 
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExportTableButton } from "@/components/reports/export-table-button" // ← AGREGAR


const COLORS = {
  linkedin: '#0a66c2',
  twitter: '#1da1f2',
  primary: '#2a5f4a',
  excellent: '#22c55e',
  good: '#3b82f6',
  average: '#eab308',
  below: '#ef4444',
}

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [data, setData] = useState<ParsedDataset | null>(null)
  const [platform, setPlatform] = useState<string>("All")
  const [dateRange, setDateRange] = useState<string>("3 months")
  const [sortBy, setSortBy] = useState<string>("engagements")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [rowsPerPage, setRowsPerPage] = useState<number>(20)
  
  useEffect(() => {
    const stored = localStorage.getItem("condor_analytics_data")
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
  }, [])
  
  const filteredData = useMemo(() => {
    if (!data) return null
    
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case "1 week":
        startDate.setDate(now.getDate() - 7)
        break
      case "2 weeks":
        startDate.setDate(now.getDate() - 14)
        break
      case "1 month":
        startDate.setDate(now.getDate() - 30)
        break
      case "3 months":
        startDate.setDate(now.getDate() - 90)
        break
      case "6 months":
        startDate.setDate(now.getDate() - 180)
        break
      case "1 year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date(0)
    }
    
    let filtered = data.dataPoints.filter(point => {
      const pointDate = new Date(point.date)
      return pointDate >= startDate && pointDate <= now
    })
    
    if (platform !== "All") {
      const normalizedPlatform = platform.toLowerCase() === 'x' ? 'twitter' : platform.toLowerCase()
      filtered = filtered.filter(p => p.source === normalizedPlatform)
    }
    
    return {
      ...data,
      dataPoints: filtered,
      dateRange: {
        start: filtered.length > 0 ? filtered[0].date : data.dateRange.start,
        end: filtered.length > 0 ? filtered[filtered.length - 1].date : data.dateRange.end,
      }
    }
  }, [data, dateRange, platform])
  
  const comparisons = useMemo(() => {
    if (!filteredData) return null
    return generateAllComparisons(filteredData)
  }, [filteredData])
  
  const recommendations = useMemo(() => {
    if (!comparisons) return []
    const allComparisons = [...comparisons.linkedin, ...comparisons.twitter]
    return generateRecommendations(allComparisons)
  }, [comparisons])
  
  const linkedinMetrics = useMemo(() => {
    if (!filteredData) return null
    return extractPlatformMetrics(filteredData, 'linkedin')
  }, [filteredData])
  
  const twitterMetrics = useMemo(() => {
    if (!filteredData) return null
    return extractPlatformMetrics(filteredData, 'twitter')
  }, [filteredData])
  
  const platformData = useMemo(() => {
    if (!filteredData) return []
    
    const linkedin = filteredData.dataPoints.filter(p => p.source === 'linkedin').length
    const twitter = filteredData.dataPoints.filter(p => p.source === 'twitter').length
    
    return [
      { name: 'LinkedIn', value: linkedin, color: COLORS.linkedin },
      { name: 'X/Twitter', value: twitter, color: COLORS.twitter },
    ].filter(d => d.value > 0)
  }, [filteredData])
  
  const engagementOverTime = useMemo(() => {
    if (!filteredData) return []
    
    const grouped = filteredData.dataPoints.reduce((acc, point) => {
      const date = point.date
      if (!acc[date]) {
        acc[date] = { date, engagements: 0, impressions: 0 }
      }
      acc[date].engagements += Number(point.metrics.engagements || 0)
      acc[date].impressions += Number(point.metrics.impressions || 0)
      return acc
    }, {} as Record<string, any>)
    
    return Object.values(grouped).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [filteredData])
  
  const benchmarkTableData = useMemo(() => {
    if (!comparisons) return []
    
    let allComps = [...comparisons.linkedin, ...comparisons.twitter]
    
    if (platform === "LinkedIn") {
      allComps = allComps.filter(c => c.platform === 'linkedin')
    } else if (platform === "X") {
      allComps = allComps.filter(c => c.platform === 'twitter')
    }
    
    return allComps
      .filter(comp => comp.actual > 0)
      .map(comp => {
        const isPercentage = !comp.kpi.includes('Avg Engagements per Post')
        
        return {
          kpi: comp.kpi,
          actual: isPercentage ? (comp.actual * 100).toFixed(2) : comp.actual.toFixed(1),
          benchmark: isPercentage ? (comp.benchmark * 100).toFixed(2) : comp.benchmark.toFixed(1),
          good: isPercentage ? (comp.good * 100).toFixed(2) : comp.good.toFixed(1),
          excellent: isPercentage ? (comp.excellent * 100).toFixed(2) : comp.excellent.toFixed(1),
          status: comp.status,
          unit: isPercentage ? '%' : '',
          description: comp.description,
          tooltip: comp.tooltip,
          industryContext: comp.industryContext,
          statusMessage: comp.statusMessage,
          source: comp.source,
        }
      })
  }, [comparisons, platform])
  
  const topContent = useMemo(() => {
    if (!filteredData) return []
    
    let posts = filteredData.dataPoints
      .filter(p => p.metrics.title && Number(p.metrics.impressions) > 0)
      .map((p, index) => {
        let engRate = Number(p.metrics.engagement_rate || 0)
        
        if (engRate < 1 && engRate > 0) {
          engRate = engRate * 100
        }
        
        return {
          id: p.id || `${p.date}-${p.source}-${index}`, // USAR ID ÚNICO
          title: String(p.metrics.title),
          source: p.source,
          date: p.date,
          link: String(p.metrics.link || ''),
          impressions: Number(p.metrics.impressions || 0),
          engagements: Number(p.metrics.engagements || 0),
          clicks: Number(p.metrics.clicks || 0),
          reactions: Number(p.metrics.reactions || p.metrics.likes || 0),
          comments: Number(p.metrics.comments || 0),
          shares: Number(p.metrics.reposts || p.metrics.shares || 0),
          engagement_rate: engRate,
        }
      })
    
    posts.sort((a, b) => {
      let vA = a[sortBy as keyof typeof a]
      let vB = b[sortBy as keyof typeof b]
      
      if (sortBy === "date") {
        vA = new Date(a.date).getTime()
        vB = new Date(b.date).getTime()
      }
      
      if (typeof vA === 'number' && typeof vB === 'number') {
        return sortDir === "desc" ? vB - vA : vA - vB
      }
      
      return 0
    })
    
    return rowsPerPage === 999 ? posts : posts.slice(0, rowsPerPage)
  }, [filteredData, sortBy, sortDir, rowsPerPage])
  
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc")
    } else {
      setSortBy(key)
      setSortDir("desc")
    }
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500/20 text-green-500'
      case 'good': return 'bg-blue-500/20 text-blue-500'
      case 'average': return 'bg-yellow-500/20 text-yellow-500'
      case 'below': return 'bg-red-500/20 text-red-500'
      default: return 'bg-neutral-500/20 text-neutral-500'
    }
  }
  
  if (!data || !filteredData) {
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
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
                    <h2 className="text-xl font-bold mb-2">No Data Available</h2>
                    <p className="text-neutral-500">Upload analytics data to generate reports</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    )
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
          <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Performance Report</h1>
                <p className="text-neutral-500 mt-1">
                  {filteredData.dateRange.start} to {filteredData.dateRange.end}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="1 month">1 month</option>
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="1 year">1 year</option>
                <option value="all">All time</option>
              </select>
              
              <div className="flex gap-2">
                {["All", "LinkedIn", "X"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      platform === p
                        ? "bg-foreground text-background"
                        : "bg-card border border-border text-foreground hover:bg-card-hover"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              
              <div className="ml-auto">
                <PDFExportButton
                  data={filteredData}
                  linkedinComparisons={comparisons?.linkedin || []}
                  twitterComparisons={comparisons?.twitter || []}
                  recommendations={recommendations}
                  topContent={topContent}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Total Posts</p>
                      <p className="text-2xl font-bold">{filteredData.dataPoints.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Total Impressions</p>
                      <p className="text-2xl font-bold">
                        {filteredData.dataPoints.reduce((sum, p) => sum + Number(p.metrics.impressions || 0), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <Target className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Avg Engagement Rate</p>
                      <p className="text-2xl font-bold">
                        {linkedinMetrics && twitterMetrics 
                          ? (((linkedinMetrics.avgEngagementRate + twitterMetrics.avgEngagementRate) / 2) * 100).toFixed(2)
                          : '0.00'}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <Award className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Performance Status</p>
                      <p className="text-2xl font-bold">
                        {comparisons && 
                          [...comparisons.linkedin, ...comparisons.twitter].filter(c => c.status === 'good' || c.status === 'excellent').length
                        } / {comparisons ? comparisons.linkedin.length + comparisons.twitter.length : 0} Good
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>Posts by platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Over Time</CardTitle>
                  <CardDescription>Daily engagement trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={engagementOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="engagements" stroke={COLORS.primary} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {benchmarkTableData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance vs Benchmarks</CardTitle>
                  <CardDescription>Your metrics compared to industry standards</CardDescription>
                </CardHeader>
                <CardContent>
                  <TooltipProvider delayDuration={100}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-semibold text-neutral-400">KPI</th>
                            <th className="text-center py-3 px-4 font-semibold text-neutral-400">Your Performance</th>
                            <th className="text-center py-3 px-4 font-semibold text-neutral-400">Industry Avg</th>
                            <th className="text-center py-3 px-4 font-semibold text-neutral-400">Good</th>
                            <th className="text-center py-3 px-4 font-semibold text-neutral-400">Excellent</th>
                            <th className="text-center py-3 px-4 font-semibold text-neutral-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {benchmarkTableData.map((row, idx) => (
                            <tr 
                              key={idx}
                              className={`border-b border-border hover:bg-card-hover transition-colors ${
                                idx % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-900/20' : ''
                              }`}
                            >
                              <td className="py-3 px-4 font-medium">
                                <div className="flex items-center gap-2">
                                  {row.kpi}
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="w-4 h-4 text-neutral-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="font-semibold mb-1">{row.tooltip}</p>
                                      <p className="text-xs text-neutral-400 mb-1">{row.description}</p>
                                      <p className="text-xs text-neutral-500">Industry: {row.industryContext}</p>
                                      <p className="text-xs text-neutral-500 italic mt-1">Source: {row.source}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-bold">{row.actual}{row.unit || '%'}</td>
                              <td className="py-3 px-4 text-center">{row.benchmark}{row.unit || '%'}</td>
                              <td className="py-3 px-4 text-center text-blue-500">{row.good}{row.unit || '%'}</td>
                              <td className="py-3 px-4 text-center text-green-500">{row.excellent}{row.unit || '%'}</td>
                              <td className="py-3 px-4 text-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className={`px-2 py-1 rounded text-xs font-medium cursor-help ${getStatusColor(row.status)}`}>
                                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">{row.statusMessage}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>
            )}
            
            {/* GRID RESPONSIVE PARA CARDS DE BENCHMARKS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {comparisons && linkedinMetrics && linkedinMetrics.totalPosts > 0 && (
                <BenchmarkComparisonCard
                  comparisons={comparisons.linkedin}
                  platform="LinkedIn"
                  icon={
                    <div className="w-10 h-10 rounded-lg bg-[#0a66c2] flex items-center justify-center text-white font-bold text-sm">
                      in
                    </div>
                  }
                />
              )}
              
              {comparisons && twitterMetrics && twitterMetrics.totalPosts > 0 && (
                <BenchmarkComparisonCard
                  comparisons={comparisons.twitter}
                  platform="X/Twitter"
                  icon={
                    <div className="w-10 h-10 rounded-lg bg-[#1da1f2] flex items-center justify-center text-white font-bold text-xl">
                      𝕏
                    </div>
                  }
                />
              )}
              
              {/* FUTURO: Agregar más plataformas aquí (YouTube, TikTok, etc.) */}
            </div>
            
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Actionable insights to improve performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-foreground">{rec}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
  <div className="flex items-center justify-between">
    <div>
      <CardTitle>Top Content Performance</CardTitle>
      <CardDescription>Best performing posts ranked by engagement</CardDescription>
    </div>
    <div className="flex items-center gap-2">
      <ExportTableButton 
  data={topContent} 
  filename={`top-content-${platform.toLowerCase()}-${dateRange.replace(' ', '-')}`}
  dateRange={dateRange}
  platform={platform}
  disabled={topContent.length === 0}
/>
      <select
        value={rowsPerPage}
        onChange={(e) => setRowsPerPage(Number(e.target.value))}
        className="px-3 py-1.5 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value={20}>Show 20</option>
        <option value={30}>Show 30</option>
        <option value={50}>Show 50</option>
        <option value={999}>Show All</option>
      </select>
    </div>
  </div>
</CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-400">#</th>
                        <th 
                          onClick={() => handleSort("title")}
                          className="text-left py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Title
                            {sortBy === "title" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-400">Platform</th>
                        <th 
                          onClick={() => handleSort("date")}
                          className="text-left py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Date
                            {sortBy === "date" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort("impressions")}
                          className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-2">
                            Impressions
                            {sortBy === "impressions" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort("engagements")}
                          className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-2">
                            Engagements
                            {sortBy === "engagements" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort("clicks")}
                          className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-2">
                            Clicks
                            {sortBy === "clicks" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort("reactions")}
                          className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-2">
                            Reactions
                            {sortBy === "reactions" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort("comments")}
                          className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-2">
                            Comments
                            {sortBy === "comments" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort("shares")}
                          className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-2">
                            Shares
                            {sortBy === "shares" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort("engagement_rate")}
                          className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center justify-end gap-2">
                            Eng. Rate
                            {sortBy === "engagement_rate" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topContent.map((post, idx) => (
                        <tr 
                          key={post.id}
                          className={`border-b border-border hover:bg-card-hover transition-colors ${
                            idx % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-900/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-neutral-400">{idx + 1}</td>
                          <td className="py-3 px-4 text-foreground max-w-xs truncate">
                            {post.link ? (
                              <a 
                                href={post.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline text-primary"
                              >
                                {post.title}
                              </a>
                            ) : (
                              post.title
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              post.source === 'linkedin' ? 'bg-blue-500/20 text-blue-400' :
                              post.source === 'twitter' ? 'bg-sky-500/20 text-sky-400' :
                              'bg-neutral-500/20 text-neutral-400'
                            }`}>
                              {post.source === 'twitter' ? 'X' : post.source.charAt(0).toUpperCase() + post.source.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-400">{post.date}</td>
                          <td className="py-3 px-4 text-right text-neutral-400">{post.impressions.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-neutral-400 font-semibold">{post.engagements.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-neutral-400">{post.clicks.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-neutral-400">{post.reactions.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-neutral-400">{post.comments.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-neutral-400">{post.shares.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-neutral-400">{post.engagement_rate.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}