/**
 * File: social-tab.tsx
 * Path: /components/dashboard/social-tab.tsx
 * Last Modified: 2025-12-06
 * Description: Tab de Social con KPIs y visualizaciones
 */

"use client"

import { KPICard } from "./kpi-card"
import { CalendarHeatmap } from "./calendar-heatmap"
import { PlatformBreakdownPie } from "@/components/dashboard/platform-breakdown-pie"
import { TopContentTab } from "./top-content-tab"
import { BarChart3, Eye, MousePointerClick, TrendingUp } from "lucide-react"
import type { ParsedDataset } from "@/lib/parsers/types"

interface SocialTabProps {
  data: ParsedDataset
  platform: string
}

/**
 * Normaliza nombre de plataforma para comparación
 */
function normalizePlatform(platform: string): string {
  const normalized = platform.toLowerCase()
  if (normalized === 'x') return 'twitter'
  return normalized
}

/**
 * Calcula KPIs agregados desde los dataPoints
 */
function calculateKPIs(data: ParsedDataset, platform: string) {
  let filteredPoints = data.dataPoints
  
  // Filtrar por plataforma si no es "All"
  if (platform !== "All") {
    const normalizedFilter = normalizePlatform(platform)
    filteredPoints = filteredPoints.filter(p => 
      p.source.toLowerCase() === normalizedFilter
    )
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

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function SocialTab({ data, platform }: SocialTabProps) {
  const kpis = calculateKPIs(data, platform)

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Posts"
          value={kpis.totalPosts}
          subText={`Social media posts`}
          icon={<BarChart3 className="w-6 h-6 text-primary" />}
        />
        
        <KPICard
          label="Total Impressions"
          value={formatNumber(kpis.totalImpressions)}
          subText="Views of your content"
          icon={<Eye className="w-6 h-6 text-primary" />}
        />
        
        <KPICard
          label="Total Engagements"
          value={formatNumber(kpis.totalEngagements)}
          subText="Likes, comments, shares"
          icon={<TrendingUp className="w-6 h-6 text-primary" />}
        />
        
        <KPICard
          label="Avg. Engagement Rate"
          value={`${kpis.avgEngagementRate.toFixed(2)}%`}
          subText="Engagement / Impressions"
          icon={<MousePointerClick className="w-6 h-6 text-primary" />}
        />
      </div>

      {/* Calendar Heatmap + Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <CalendarHeatmap data={data} platform={platform} dateRange="all" />
        </div>
        
        <div className="lg:col-span-1">
          <PlatformBreakdownPie data={data} platform={platform} />
        </div>
      </div>

      {/* Top Content Table */}
      <TopContentTab data={data} platform={platform} />
    </div>
  )
}