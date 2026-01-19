<<<<<<< HEAD
/**
 * File: social-tab.tsx
 * Path: /components/dashboard/social-tab.tsx
 * Last Modified: 2025-12-22
 * Description: Social tab con PostDrilldown arreglado
 */

"use client"

import { useState } from "react"
import { KPICard } from "./kpi-card"
import { CalendarHeatmap } from "./calendar-heatmap"
import { PlatformBreakdownPie } from "@/components/dashboard/platform-breakdown-pie"
import { TopContentTab } from "./top-content-tab"
import { PostDrilldown } from "./post-drilldown"
import { DemographicCard } from "./demographic-card"
import { FollowersChart } from "./followers-chart"
import { BarChart3, Eye, MousePointerClick, TrendingUp, MapPin, Briefcase, Users, Building2, Award } from "lucide-react"
import type { ParsedDataset, DataPoint } from "@/lib/parsers/types"

interface SocialTabProps {
  data: ParsedDataset
  platform: string
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

export function SocialTab({ data, platform, followersData, visitorsData }: SocialTabProps) {
  // ✅ NUEVO: Estado para PostDrilldown
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
  
  // ✅ NUEVO: Handler que recibe DataPoint[]
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

  return (
    <div className="space-y-6">
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
      
      {/* ✅ NUEVO PostDrilldown */}
      <PostDrilldown
        open={drilldownOpen}
        dateStr={selectedDate}
        posts={selectedPosts}
        onClose={handleCloseDrilldown}
      />
    </div>
  )
=======
/**
 * File: social-tab.tsx
 * Path: /components/dashboard/social-tab.tsx
 * Last Modified: 2025-12-22
 * Description: Social tab con PostDrilldown arreglado
 */

"use client"

import { useState } from "react"
import { KPICard } from "./kpi-card"
import { CalendarHeatmap } from "./calendar-heatmap"
import { PlatformBreakdownPie } from "@/components/dashboard/platform-breakdown-pie"
import { TopContentTab } from "./top-content-tab"
import { PostDrilldown } from "./post-drilldown"
import { DemographicCard } from "./demographic-card"
import { FollowersChart } from "./followers-chart"
import { BarChart3, Eye, MousePointerClick, TrendingUp, MapPin, Briefcase, Users, Building2, Award } from "lucide-react"
import type { ParsedDataset, DataPoint } from "@/lib/parsers/types"

interface SocialTabProps {
  data: ParsedDataset
  platform: string
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

export function SocialTab({ data, platform, followersData, visitorsData }: SocialTabProps) {
  // ✅ NUEVO: Estado para PostDrilldown
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
  
  // ✅ NUEVO: Handler que recibe DataPoint[]
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

  return (
    <div className="space-y-6">
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
      
      {/* ✅ NUEVO PostDrilldown */}
      <PostDrilldown
        open={drilldownOpen}
        dateStr={selectedDate}
        posts={selectedPosts}
        onClose={handleCloseDrilldown}
      />
    </div>
  )
>>>>>>> 77e52a04db6d7e0dad28c1b0133f5773419ee0ae
}