
/**
 * File: overview-tab.tsx
 * Path: /components/dashboard/overview-tab.tsx
 * Last Modified: 2025-12-22
 * Description: Overview con KPIs dinámicos y PostDrilldown agregado
 */

"use client"

import { useState } from "react"
import { KPICard } from "./kpi-card"
import { CalendarHeatmap } from "./calendar-heatmap"
import { PlatformBreakdownPie } from "@/components/dashboard/platform-breakdown-pie"
import { TopContentTab } from "./top-content-tab"
import { PostDrilldown } from "./post-drilldown"
import { BarChart3, Eye, MousePointerClick, TrendingUp, Users, UserPlus } from "lucide-react"
import type { ParsedDataset, DataPoint } from "@/lib/parsers/types"

interface OverviewTabProps {
  data: ParsedDataset
  platform: string
  dateRange: string
}

function normalizePlatform(platform: string): string {
  const normalized = platform.toLowerCase()
  if (normalized === 'x') return 'twitter'
  return normalized
}

/**
 * Detecta qué métricas están disponibles en los datos
 */
function detectAvailableMetrics(data: ParsedDataset): {
  hasContent: boolean
  hasFollowers: boolean
  hasVisitors: boolean
} {
  if (data.dataPoints.length === 0) {
    return { hasContent: false, hasFollowers: false, hasVisitors: false }
  }
  
  const firstMetrics = data.dataPoints[0].metrics
  
  const hasContent = 'impressions' in firstMetrics || 'engagements' in firstMetrics
  const hasFollowers = 'total_followers' in firstMetrics || 'new_followers' in firstMetrics
  const hasVisitors = 'page_views' in firstMetrics || 'unique_visitors' in firstMetrics
  
  return { hasContent, hasFollowers, hasVisitors }
}

/**
 * Calcula KPIs para Content Analytics
 */
function calculateContentKPIs(data: ParsedDataset, platform: string) {
  let filteredPoints = data.dataPoints
  
  if (platform !== "All") {
    const normalizedFilter = normalizePlatform(platform)
    filteredPoints = filteredPoints.filter(p => p.source.toLowerCase() === normalizedFilter)
  }
  
  if (filteredPoints.length === 0) {
    return {
      totalPosts: 0,
      totalImpressions: 0,
      totalEngagements: 0,
      totalClicks: 0,
      avgEngagementRate: 0,
    }
  }
  
  const totals = filteredPoints.reduce((acc, point) => {
    return {
      totalImpressions: acc.totalImpressions + (Number(point.metrics.impressions) || 0),
      totalEngagements: acc.totalEngagements + (Number(point.metrics.engagements) || 0),
      totalClicks: acc.totalClicks + (Number(point.metrics.clicks) || 0),
      totalEngagementRates: acc.totalEngagementRates + (Number(point.metrics.engagement_rate) || 0),
    }
  }, {
    totalImpressions: 0,
    totalEngagements: 0,
    totalClicks: 0,
    totalEngagementRates: 0,
  })
  
  const avgEngagementRate = totals.totalEngagementRates / filteredPoints.length
  
  return {
    totalPosts: filteredPoints.length,
    totalImpressions: totals.totalImpressions,
    totalEngagements: totals.totalEngagements,
    totalClicks: totals.totalClicks,
    avgEngagementRate,
  }
}

/**
 * Calcula KPIs para Followers Analytics
 */
function calculateFollowersKPIs(data: ParsedDataset, platform: string) {
  let filteredPoints = data.dataPoints
  
  if (platform !== "All") {
    const normalizedFilter = normalizePlatform(platform)
    filteredPoints = filteredPoints.filter(p => p.source.toLowerCase() === normalizedFilter)
  }
  
  if (filteredPoints.length === 0) {
    return {
      currentFollowers: 0,
      totalNewFollowers: 0,
      totalOrganicFollowers: 0,
      totalSponsoredFollowers: 0,
      avgDailyGrowth: 0,
    }
  }
  
  // Último dato tiene el total actual de followers
  const lastPoint = filteredPoints[filteredPoints.length - 1]
  const currentFollowers = Number(lastPoint.metrics.total_followers) || 0
  
  const totals = filteredPoints.reduce((acc, point) => {
    return {
      totalNewFollowers: acc.totalNewFollowers + (Number(point.metrics.new_followers) || 0),
      totalOrganicFollowers: acc.totalOrganicFollowers + (Number(point.metrics.organic_followers) || 0),
      totalSponsoredFollowers: acc.totalSponsoredFollowers + (Number(point.metrics.sponsored_followers) || 0),
    }
  }, {
    totalNewFollowers: 0,
    totalOrganicFollowers: 0,
    totalSponsoredFollowers: 0,
  })
  
  const avgDailyGrowth = totals.totalNewFollowers / filteredPoints.length
  
  return {
    currentFollowers,
    totalNewFollowers: totals.totalNewFollowers,
    totalOrganicFollowers: totals.totalOrganicFollowers,
    totalSponsoredFollowers: totals.totalSponsoredFollowers,
    avgDailyGrowth,
  }
}

/**
 * Calcula KPIs para Visitors Analytics
 */
function calculateVisitorsKPIs(data: ParsedDataset, platform: string) {
  let filteredPoints = data.dataPoints
  
  if (platform !== "All") {
    const normalizedFilter = normalizePlatform(platform)
    filteredPoints = filteredPoints.filter(p => p.source.toLowerCase() === normalizedFilter)
  }
  
  if (filteredPoints.length === 0) {
    return {
      totalPageViews: 0,
      totalUniqueVisitors: 0,
      totalButtonClicks: 0,
      avgDailyViews: 0,
    }
  }
  
  const totals = filteredPoints.reduce((acc, point) => {
    return {
      totalPageViews: acc.totalPageViews + (Number(point.metrics.page_views) || 0),
      totalUniqueVisitors: acc.totalUniqueVisitors + (Number(point.metrics.unique_visitors) || 0),
      totalButtonClicks: acc.totalButtonClicks + (Number(point.metrics.custom_button_clicks) || 0),
    }
  }, {
    totalPageViews: 0,
    totalUniqueVisitors: 0,
    totalButtonClicks: 0,
  })
  
  const avgDailyViews = totals.totalPageViews / filteredPoints.length
  
  return {
    totalPageViews: totals.totalPageViews,
    totalUniqueVisitors: totals.totalUniqueVisitors,
    totalButtonClicks: totals.totalButtonClicks,
    avgDailyViews,
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return Math.round(num).toString()
}

export function OverviewTab({ data, platform, dateRange }: OverviewTabProps) {
  // ✅ NUEVO: Estado para PostDrilldown
  const [drilldownOpen, setDrilldownOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<DataPoint[]>([])

  const availableMetrics = detectAvailableMetrics(data)
  
  // Calcular KPIs según tipo de datos disponibles
  const contentKPIs = availableMetrics.hasContent ? calculateContentKPIs(data, platform) : null
  const followersKPIs = availableMetrics.hasFollowers ? calculateFollowersKPIs(data, platform) : null
  const visitorsKPIs = availableMetrics.hasVisitors ? calculateVisitorsKPIs(data, platform) : null

  // ✅ NUEVO: Handler para clicks en el calendario
  const handleDateClick = (dateStr: string, posts: DataPoint[]) => {
    setSelectedDate(dateStr)
    setSelectedPosts(posts)
    setDrilldownOpen(true)
  }

  const handleCloseDrilldown = () => {
    setDrilldownOpen(false)
    setSelectedDate(null)
    setSelectedPosts([])
  }

  return (
    <div className="space-y-6">
      {/* Content KPIs */}
      {contentKPIs && (
        <>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-3">Content Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                label="Total Posts"
                value={contentKPIs.totalPosts}
                subText={`Across ${platform === "All" ? "all platforms" : platform}`}
                icon={<BarChart3 className="w-6 h-6 text-primary" />}
              />
              
              <KPICard
                label="Total Impressions"
                value={formatNumber(contentKPIs.totalImpressions)}
                subText="Views of your content"
                icon={<Eye className="w-6 h-6 text-primary" />}
              />
              
              <KPICard
                label="Total Engagements"
                value={formatNumber(contentKPIs.totalEngagements)}
                subText="Likes, comments, shares"
                icon={<TrendingUp className="w-6 h-6 text-primary" />}
              />
              
              <KPICard
                label="Avg. Engagement Rate"
                value={`${contentKPIs.avgEngagementRate.toFixed(2)}%`}
                subText="Engagement / Impressions"
                icon={<MousePointerClick className="w-6 h-6 text-primary" />}
              />
            </div>
          </div>

          {/* Platform Breakdown + Calendar Heatmap para Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <PlatformBreakdownPie data={data} platform={platform} />
            </div>
            
            <div className="lg:col-span-3">
              <CalendarHeatmap 
                data={data} 
                platform={platform} 
                dateRange={dateRange}
                onDateClick={handleDateClick}
              />
            </div>
          </div>

          {/* Top Content Table */}
          <TopContentTab data={data} platform={platform} />
        </>
      )}

      {/* Followers KPIs */}
      {followersKPIs && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-3">Audience Growth</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Total Followers"
              value={formatNumber(followersKPIs.currentFollowers)}
              subText="Current follower count"
              icon={<Users className="w-6 h-6 text-primary" />}
            />
            
            <KPICard
              label="New Followers"
              value={formatNumber(followersKPIs.totalNewFollowers)}
              subText={`In ${dateRange}`}
              icon={<UserPlus className="w-6 h-6 text-primary" />}
            />
            
            <KPICard
              label="Organic Growth"
              value={formatNumber(followersKPIs.totalOrganicFollowers)}
              subText="Non-sponsored followers"
              icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            />
            
            <KPICard
              label="Avg. Daily Growth"
              value={formatNumber(followersKPIs.avgDailyGrowth)}
              subText="Followers per day"
              icon={<BarChart3 className="w-6 h-6 text-primary" />}
            />
          </div>
        </div>
      )}

      {/* Visitors KPIs */}
      {visitorsKPIs && (
        <div>
          <h2 className="text-xl font-bold text-foreground mb-3">Profile Visitors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Total Page Views"
              value={formatNumber(visitorsKPIs.totalPageViews)}
              subText="Profile visits"
              icon={<Eye className="w-6 h-6 text-primary" />}
            />
            
            <KPICard
              label="Unique Visitors"
              value={formatNumber(visitorsKPIs.totalUniqueVisitors)}
              subText="Different people"
              icon={<Users className="w-6 h-6 text-primary" />}
            />
            
            <KPICard
              label="Button Clicks"
              value={formatNumber(visitorsKPIs.totalButtonClicks)}
              subText="Custom button interactions"
              icon={<MousePointerClick className="w-6 h-6 text-primary" />}
            />
            
            <KPICard
              label="Avg. Daily Views"
              value={formatNumber(visitorsKPIs.avgDailyViews)}
              subText="Views per day"
              icon={<BarChart3 className="w-6 h-6 text-primary" />}
            />
          </div>
        </div>
      )}

      {/* Si no hay datos */}
      {!availableMetrics.hasContent && !availableMetrics.hasFollowers && !availableMetrics.hasVisitors && (
        <div className="text-center py-12">
          <p className="text-neutral-500">No metrics available to display</p>
        </div>
      )}

      {/* ✅ NUEVO: PostDrilldown */}
      <PostDrilldown
        open={drilldownOpen}
        dateStr={selectedDate}
        posts={selectedPosts}
        onClose={handleCloseDrilldown}
      />
    </div>
  )
}