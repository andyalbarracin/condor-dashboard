/**
 * File: social-tab.tsx
 * Path: /components/dashboard/social-tab.tsx
 * Last Modified: 2026-02-02
 * Description: Social tab con date range filtering para followers
 */

"use client"

import { useState, useMemo } from "react"
import { KPICard } from "./kpi-card"
import { CalendarHeatmap } from "./calendar-heatmap"
import { PlatformBreakdownPie } from "@/components/dashboard/platform-breakdown-pie"
import { TopContentTab } from "./top-content-tab"
import { PostDrilldown } from "./post-drilldown"
import { DemographicCard } from "./demographic-card"
import { FollowersChart } from "./followers-chart"
import { BarChart3, Eye, MousePointerClick, TrendingUp, MapPin, Briefcase, Users, Building2, Award, UserPlus } from "lucide-react"
import type { ParsedDataset, DataPoint } from "@/lib/parsers/types"

interface SocialTabProps {
  data: ParsedDataset
  platform: string
  dateRange: string  // ⭐ NUEVO
  followersData?: ParsedDataset | null
  visitorsData?: ParsedDataset | null
}

function normalizePlatform(platform: string): string {
  const normalized = platform.toLowerCase()
  if (normalized === 'x') return 'twitter'
  return normalized
}

function calculateKPIs(data: ParsedDataset, platform: string) {
  let filteredPoints = data.dataPoints
  
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

function extractDemographics(data: ParsedDataset | null | undefined, sheetName: string) {
  if (!data || !data.rawHeaders) return []
  
  return data.dataPoints
    .filter(p => {
      const hasLocationData = p.metrics.Location || p.metrics.location
      const hasJobData = p.metrics['Job function'] || p.metrics.job_function
      const hasIndustryData = p.metrics.Industry || p.metrics.industry
      const hasSeniorityData = p.metrics.Seniority || p.metrics.seniority
      const hasCompanySizeData = p.metrics['Company size'] || p.metrics.company_size
      
      return hasLocationData || hasJobData || hasIndustryData || hasSeniorityData || hasCompanySizeData
    })
    .map(p => ({
      label: String(p.metrics[sheetName] || p.metrics[sheetName.toLowerCase().replace(' ', '_')] || ''),
      value: Number(p.metrics.total_followers || p.metrics['Total followers'] || p.metrics['Total views'] || 0)
    }))
    .filter(item => item.label && item.value > 0)
    .sort((a, b) => b.value - a.value)
}

function extractFollowersTimeSeries(data: ParsedDataset | null | undefined) {
  if (!data) return []
  
  return data.dataPoints
    .filter(p => p.metrics.total_followers !== undefined || p.metrics['Total followers'] !== undefined)
    .map(p => ({
      date: p.date,
      total_followers: Number(p.metrics.total_followers || p.metrics['Total followers'] || 0),
      organic_followers: Number(p.metrics.organic_followers || p.metrics['Organic followers'] || 0),
      sponsored_followers: Number(p.metrics.sponsored_followers || p.metrics['Sponsored followers'] || 0),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// ⭐ MODIFICADA: Ahora filtra por dateRange
function calculateFollowersStats(followersTimeSeries: any[], dateRange: string) {
  if (followersTimeSeries.length === 0) {
    return {
      totalGained: 0,
      startCount: 0,
      endCount: 0,
      growthRate: 0
    }
  }

  // ⭐ NUEVO: Filtrar por dateRange
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
  
  const filtered = followersTimeSeries.filter(point => {
    const pointDate = new Date(point.date)
    return pointDate >= startDate && pointDate <= now
  })
  
  if (filtered.length === 0) {
    return {
      totalGained: 0,
      startCount: 0,
      endCount: 0,
      growthRate: 0
    }
  }

  // Sumar todos los followers ganados en el período FILTRADO
  const totalGained = filtered.reduce((sum, d) => sum + d.total_followers, 0)
  
  const startCount = 0
  const endCount = totalGained
  const growthRate = startCount > 0 ? ((endCount - startCount) / startCount) * 100 : 0

  return {
    totalGained,
    startCount,
    endCount,
    growthRate
  }
}

export function SocialTab({ data, platform, dateRange, followersData, visitorsData }: SocialTabProps) {
  const [drilldownOpen, setDrilldownOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedPosts, setSelectedPosts] = useState<DataPoint[]>([])
  
  const kpis = calculateKPIs(data, platform)
  
  const followersLocation = extractDemographics(followersData, 'Location')
  const followersJobFunction = extractDemographics(followersData, 'Job function')
  const followersIndustry = extractDemographics(followersData, 'Industry')
  const followersSeniority = extractDemographics(followersData, 'Seniority')
  const followersCompanySize = extractDemographics(followersData, 'Company size')
  
  const visitorsLocation = extractDemographics(visitorsData, 'Location')
  const visitorsJobFunction = extractDemographics(visitorsData, 'Job function')
  const visitorsIndustry = extractDemographics(visitorsData, 'Industry')
  const visitorsSeniority = extractDemographics(visitorsData, 'Seniority')
  const visitorsCompanySize = extractDemographics(visitorsData, 'Company size')
  
  const followersTimeSeries = extractFollowersTimeSeries(followersData)
  
  // ⭐ MODIFICADO: Ahora pasa dateRange
  const followersStats = useMemo(() => {
    return calculateFollowersStats(followersTimeSeries, dateRange)
  }, [followersTimeSeries, dateRange])

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

  const hasFollowersData = followersLocation.length > 0 || followersTimeSeries.length > 0
  const hasVisitorsData = visitorsLocation.length > 0
  
  // ⭐ NUEVO: Solo mostrar demographics si realmente hay datos
  const hasDemographicData = followersLocation.length > 0 || 
                             followersJobFunction.length > 0 || 
                             followersIndustry.length > 0 || 
                             followersSeniority.length > 0 || 
                             followersCompanySize.length > 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          label="Total Posts"
          value={kpis.totalPosts}
          subText={`Social media posts`}
          icon={<BarChart3 className="w-6 h-6 text-primary" />}
          tooltipKey="total_posts"
        />
        
        <KPICard
          label="Total Impressions"
          value={formatNumber(kpis.totalImpressions)}
          subText="Views of your content"
          icon={<Eye className="w-6 h-6 text-primary" />}
          tooltipKey="total_impressions"
        />
        
        <KPICard
          label="Total Engagements"
          value={formatNumber(kpis.totalEngagements)}
          subText="Likes, comments, shares"
          icon={<TrendingUp className="w-6 h-6 text-primary" />}
          tooltipKey="total_engagements"
        />
        
        <KPICard
          label="Avg. Engagement Rate"
          value={`${kpis.avgEngagementRate.toFixed(2)}%`}
          subText="Engagement / Impressions"
          icon={<MousePointerClick className="w-6 h-6 text-primary" />}
          tooltipKey="engagement_rate"
        />

        {followersTimeSeries.length > 0 && (
          <KPICard
            label="Followers Gained"
            value={`+${followersStats.totalGained.toLocaleString()}`}
            subText={followersStats.endCount > 0 
              ? `Total: ${followersStats.endCount.toLocaleString()} followers` 
              : `New followers in period`}
            icon={<UserPlus className="w-6 h-6 text-primary" />}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <CalendarHeatmap 
            data={data} 
            platform={platform} 
            dateRange="all"
            onDateClick={handleDateClick}
          />
        </div>
        
        <div className="lg:col-span-1">
          <PlatformBreakdownPie data={data} platform={platform} />
        </div>
      </div>

      <TopContentTab data={data} platform={platform} />
      
      {hasFollowersData && (
        <>
          {followersTimeSeries.length > 0 && (
            <FollowersChart data={followersTimeSeries} />
          )}
          
          {/* ⭐ MODIFICADO: Solo mostrar título si hay datos demográficos */}
          {hasDemographicData && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Follower Demographics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followersLocation.length > 0 && (
                  <DemographicCard
                    title="Location"
                    description="Where your followers are from"
                    data={followersLocation}
                    icon={<MapPin className="w-5 h-5" />}
                    valueLabel="followers"
                  />
                )}
                
                {followersJobFunction.length > 0 && (
                  <DemographicCard
                    title="Job Function"
                    description="Professional roles of your followers"
                    data={followersJobFunction}
                    icon={<Briefcase className="w-5 h-5" />}
                    valueLabel="followers"
                  />
                )}
                
                {followersIndustry.length > 0 && (
                  <DemographicCard
                    title="Industry"
                    description="Industries your followers work in"
                    data={followersIndustry}
                    icon={<Building2 className="w-5 h-5" />}
                    valueLabel="followers"
                  />
                )}
                
                {followersSeniority.length > 0 && (
                  <DemographicCard
                    title="Seniority"
                    description="Career level of your followers"
                    data={followersSeniority}
                    icon={<Award className="w-5 h-5" />}
                    valueLabel="followers"
                  />
                )}
                
                {followersCompanySize.length > 0 && (
                  <DemographicCard
                    title="Company Size"
                    description="Size of companies your followers work at"
                    data={followersCompanySize}
                    icon={<Users className="w-5 h-5" />}
                    valueLabel="followers"
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
      
      {hasVisitorsData && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Visitor Demographics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visitorsLocation.length > 0 && (
              <DemographicCard
                title="Location"
                description="Where your visitors are from"
                data={visitorsLocation}
                icon={<MapPin className="w-5 h-5" />}
                valueLabel="views"
              />
            )}
            
            {visitorsJobFunction.length > 0 && (
              <DemographicCard
                title="Job Function"
                description="Professional roles of your visitors"
                data={visitorsJobFunction}
                icon={<Briefcase className="w-5 h-5" />}
                valueLabel="views"
              />
            )}
            
            {visitorsIndustry.length > 0 && (
              <DemographicCard
                title="Industry"
                description="Industries your visitors work in"
                data={visitorsIndustry}
                icon={<Building2 className="w-5 h-5" />}
                valueLabel="views"
              />
            )}
            
            {visitorsSeniority.length > 0 && (
              <DemographicCard
                title="Seniority"
                description="Career level of your visitors"
                data={visitorsSeniority}
                icon={<Award className="w-5 h-5" />}
                valueLabel="views"
              />
            )}
            
            {visitorsCompanySize.length > 0 && (
              <DemographicCard
                title="Company Size"
                description="Size of companies your visitors work at"
                data={visitorsCompanySize}
                icon={<Users className="w-5 h-5" />}
                valueLabel="views"
              />
            )}
          </div>
        </div>
      )}
      
      <PostDrilldown
        open={drilldownOpen}
        dateStr={selectedDate}
        posts={selectedPosts}
        onClose={handleCloseDrilldown}
      />
    </div>
  )
}