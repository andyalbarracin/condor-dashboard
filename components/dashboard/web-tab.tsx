/**
 * File: web-tab.tsx
 * Path: /components/dashboard/web-tab.tsx
 * Last Modified: 2026-03-18
 * Description: Web Analytics tab - Campaign Performance table with GA4 data.
 *              FIX: Replaced custom CSS tooltips with Radix UI Tooltip (portal-based)
 *              to escape overflow-x-auto clipping that made tooltips invisible.
 */

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { KPICard } from "./kpi-card"
import { AlertCircle, Globe, Target, TrendingUp, Activity } from "lucide-react"
import { PieChart, Pie, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import type { ParsedDataset } from "@/lib/parsers/types"
import type { GAUTMCampaign } from "@/lib/parsers/google-analytics-parser"

interface WebTabProps {
  data?: ParsedDataset | null
}

const MEDIUM_COLORS: Record<string, string> = {
  'organic': '#22c55e',
  'direct': '#3b82f6',
  '(none)': '#3b82f6',
  'referral': '#a855f7',
  'website': '#8b5cf6',
  'none': '#64748b',
  'post': '#0ea5e9',
  'email': '#f97316',
  '(unattributable)': '#94a3b8',
  '(not set)': '#94a3b8',
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function WebTab({ data }: WebTabProps) {
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [mediumFilter, setMediumFilter] = useState<string>("All")
  const [sortBy, setSortBy] = useState<'source' | 'medium' | 'campaign' | 'campaign_id' | 'sessions'>('sessions')
  
  const utmCampaigns = useMemo(() => {
    if (!data?.metadata?.utmCampaigns) return []
    return (data.metadata.utmCampaigns as GAUTMCampaign[])
  }, [data])
  
  const totalSessions = useMemo(() => {
    return utmCampaigns.reduce((sum, c) => sum + c.sessions, 0)
  }, [utmCampaigns])
  
  // Agrupar por medium para el pie chart
  const trafficByMedium = useMemo(() => {
    const byMedium = utmCampaigns.reduce((acc, campaign) => {
      let medium = campaign.medium || '(not set)'
      if (medium === '(none)') medium = 'direct'
      if (!acc[medium]) acc[medium] = 0
      acc[medium] += campaign.sessions
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(byMedium)
      .map(([medium, sessions]) => ({
        name: medium.charAt(0).toUpperCase() + medium.slice(1),
        value: sessions,
        fill: MEDIUM_COLORS[medium.toLowerCase()] || '#64748b'
      }))
      .sort((a, b) => b.value - a.value)
  }, [utmCampaigns])
  
  // Top source
  const topSource = useMemo(() => {
    const bySource = utmCampaigns.reduce((acc, c) => {
      if (!acc[c.source]) acc[c.source] = 0
      acc[c.source] += c.sessions
      return acc
    }, {} as Record<string, number>)
    
    const sorted = Object.entries(bySource).sort((a, b) => b[1] - a[1])
    return sorted[0] ? { name: sorted[0][0], sessions: sorted[0][1] } : null
  }, [utmCampaigns])
  
  // Top medium
  const topMedium = useMemo(() => {
    if (trafficByMedium.length === 0) return null
    return trafficByMedium[0]
  }, [trafficByMedium])
  
  // Avg sessions per campaign
  const avgSessionsPerCampaign = useMemo(() => {
    if (utmCampaigns.length === 0) return 0
    return Math.round(totalSessions / utmCampaigns.length)
  }, [utmCampaigns, totalSessions])
  
  // Top 5 campaigns
  const top5Campaigns = useMemo(() => {
    return utmCampaigns
      .slice()
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5)
  }, [utmCampaigns])
  
  // Obtener mediums únicos para filtros
  const uniqueMediums = useMemo(() => {
    const mediums = new Set(utmCampaigns.map(c => c.medium || '(not set)'))
    return ['All', ...Array.from(mediums).sort()]
  }, [utmCampaigns])
  
  // Filtrar campaigns por medium + Sort dinámico
  const filteredCampaigns = useMemo(() => {
    let filtered = utmCampaigns
    if (mediumFilter !== 'All') {
      filtered = filtered.filter(c => (c.medium || '(not set)') === mediumFilter)
    }
    
    // Sort dinámico por columna seleccionada
    return filtered.sort((a, b) => {
      let compareA: string | number = ''
      let compareB: string | number = ''
      
      switch (sortBy) {
        case 'source':
          compareA = a.source
          compareB = b.source
          break
        case 'medium':
          compareA = a.medium || ''
          compareB = b.medium || ''
          break
        case 'campaign':
          compareA = a.campaign
          compareB = b.campaign
          break
        case 'campaign_id':
          compareA = a.campaign_id
          compareB = b.campaign_id
          break
        case 'sessions':
          compareA = a.sessions
          compareB = b.sessions
          break
      }
      
      if (typeof compareA === 'string' && typeof compareB === 'string') {
        return sortDir === 'desc' 
          ? compareB.localeCompare(compareA)
          : compareA.localeCompare(compareB)
      }
      
      return sortDir === 'desc' ? (compareB as number) - (compareA as number) : (compareA as number) - (compareB as number)
    })
  }, [utmCampaigns, mediumFilter, sortDir, sortBy])
  
  if (!data) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-500">No Data Available</p>
              <p className="text-sm text-yellow-400 mt-1">
                Upload a Google Analytics 4 CSV export to visualize web analytics here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total Sessions"
            value={formatNumber(totalSessions)}
            subText={`${data.dateRange.start} to ${data.dateRange.end}`}
            icon={<Globe className="w-6 h-6 text-primary" />}
          />
          
          <KPICard
            label="Top Source"
            value={topSource ? topSource.name.charAt(0).toUpperCase() + topSource.name.slice(1) : '-'}
            subText={topSource ? `${topSource.sessions} sessions (${((topSource.sessions / totalSessions) * 100).toFixed(0)}%)` : 'No data'}
            icon={<Target className="w-6 h-6 text-blue-500" />}
          />
          
          <KPICard
            label="Top Medium"
            value={topMedium ? topMedium.name : '-'}
            subText={topMedium ? `${topMedium.value} sessions (${((topMedium.value / totalSessions) * 100).toFixed(0)}%)` : 'No data'}
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          />
          
          <KPICard
            label="Active Campaigns"
            value={utmCampaigns.length.toString()}
            subText={`Avg. ${avgSessionsPerCampaign} sessions/campaign`}
            icon={<Activity className="w-6 h-6 text-purple-500" />}
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic by Medium Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Traffic by Medium</CardTitle>
              <CardDescription>Session distribution by acquisition medium</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficByMedium}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                  />
                  <RechartsTooltip 
                    formatter={(value: number, name: string) => [
                      `${value} sessions`,
                      name
                    ]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry: any) => `${value}: ${((entry.payload.value / totalSessions) * 100).toFixed(0)}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Top 5 Campaigns + Understanding GA4 */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Campaigns</CardTitle>
              <CardDescription>Highest performing campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Barras minimalistas */}
              <div className="space-y-3">
                {top5Campaigns.map((campaign, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{campaign.source_medium}</span>
                      <span className="text-neutral-400">{campaign.sessions} sessions</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                      <div 
                        className="bg-foreground rounded-full h-2 transition-all"
                        style={{ width: `${(campaign.sessions / top5Campaigns[0].sessions) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Understanding GA4 Attribution */}
              <div className="border-t border-border pt-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-foreground">Understanding GA4 Attribution</h4>
                </div>
                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <p><span className="font-semibold text-foreground">Direct:</span> Users who typed your URL directly or accessed via bookmarks. No UTM tracking available.</p>
                  <p><span className="font-semibold text-foreground">Organic:</span> Unpaid traffic from search engines (Google, Bing, etc.) where users found your site through search results.</p>
                  <p><span className="font-semibold text-foreground">Post:</span> Traffic from social media campaigns tracked with UTM parameters (LinkedIn, X/Twitter).</p>
                  <p><span className="font-semibold text-foreground">None / (not set):</span> GA4 could not attribute the traffic source. Common causes: missing UTM parameters, privacy settings, or cross-domain tracking issues.</p>
                  <p><span className="font-semibold text-foreground">Referral:</span> Traffic from external websites that link to your site.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Campaign Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Detailed UTM campaign analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Medium Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {uniqueMediums.map(medium => (
                <button
                  key={medium}
                  onClick={() => setMediumFilter(medium)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    mediumFilter === medium
                      ? 'bg-foreground text-background'
                      : 'bg-card border border-border text-foreground hover:bg-accent'
                  }`}
                >
                  {medium.charAt(0).toUpperCase() + medium.slice(1)} ({
                    medium === 'All' 
                      ? utmCampaigns.length 
                      : utmCampaigns.filter(c => (c.medium || '(not set)') === medium).length
                  })
                </button>
              ))}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-400">#</th>
                    <th 
                      onClick={() => {
                        setSortDir(sortDir === "desc" ? "asc" : "desc")
                        setSortBy('source')
                      }}
                      className="text-left py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Source
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-neutral-500 cursor-help">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Origin of the traffic (e.g., google, linkedin, x)</p>
                          </TooltipContent>
                        </Tooltip>
                        {sortBy === 'source' && (sortDir === "desc" ? <span className="text-xs">↓</span> : <span className="text-xs">↑</span>)}
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortDir(sortDir === "desc" ? "asc" : "desc")
                        setSortBy('medium')
                      }}
                      className="text-left py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Medium
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-neutral-500 cursor-help">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Type of traffic (organic, post, referral, email)</p>
                          </TooltipContent>
                        </Tooltip>
                        {sortBy === 'medium' && (sortDir === "desc" ? <span className="text-xs">↓</span> : <span className="text-xs">↑</span>)}
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortDir(sortDir === "desc" ? "asc" : "desc")
                        setSortBy('campaign')
                      }}
                      className="text-left py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Campaign
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-neutral-500 cursor-help">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Campaign name from utm_campaign parameter</p>
                          </TooltipContent>
                        </Tooltip>
                        {sortBy === 'campaign' && (sortDir === "desc" ? <span className="text-xs">↓</span> : <span className="text-xs">↑</span>)}
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortDir(sortDir === "desc" ? "asc" : "desc")
                        setSortBy('campaign_id')
                      }}
                      className="text-left py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Campaign ID
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-neutral-500 cursor-help">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Unique identifier from utm_id parameter</p>
                          </TooltipContent>
                        </Tooltip>
                        {sortBy === 'campaign_id' && (sortDir === "desc" ? <span className="text-xs">↓</span> : <span className="text-xs">↑</span>)}
                      </div>
                    </th>
                    <th 
                      onClick={() => {
                        setSortDir(sortDir === "desc" ? "asc" : "desc")
                        setSortBy('sessions')
                      }}
                      className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center justify-end gap-2">
                        Sessions
                        {sortBy === 'sessions' && (sortDir === "desc" ? <span>↓</span> : <span>↑</span>)}
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-400">
                      <div className="flex items-center justify-end gap-1">
                        % Total
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-neutral-500 cursor-help">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Percentage of total sessions</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign, idx) => (
                    <tr 
                      key={idx}
                      className={`border-b border-border hover:bg-card-hover transition-colors ${idx % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-900/20' : ''}`}
                    >
                      <td className="py-3 px-4 text-neutral-400">{idx + 1}</td>
                      <td className="py-3 px-4 text-foreground">{campaign.source}</td>
                      <td className="py-3 px-4 text-foreground">
                        <span className="px-2 py-1 rounded-md text-xs font-medium" style={{ 
                          backgroundColor: (MEDIUM_COLORS[campaign.medium?.toLowerCase() || ''] || '#64748b') + '20',
                          color: MEDIUM_COLORS[campaign.medium?.toLowerCase() || ''] || '#64748b'
                        }}>
                          {campaign.medium}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground font-medium">{campaign.campaign}</td>
                      <td className="py-3 px-4 text-neutral-400 font-mono text-xs">{campaign.campaign_id}</td>
                      <td className="py-3 px-4 text-right text-foreground font-semibold">{campaign.sessions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-neutral-400">{((campaign.sessions / totalSessions) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}