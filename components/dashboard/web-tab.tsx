/**
 * File: web-tab.tsx
 * Path: /components/dashboard/web-tab.tsx
 * Last Modified: 2025-12-09
 * Description: Tab de Web Analytics con datos de Google Analytics 4
 */

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "./kpi-card"
import { AlertCircle, Globe, Users, MousePointerClick, TrendingUp, Activity, ChevronUp, ChevronDown } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import type { ParsedDataset } from "@/lib/parsers/types"
import type { GATrafficSource } from "@/lib/parsers/google-analytics-parser"

interface WebTabProps {
  data?: ParsedDataset | null
}

const CHANNEL_COLORS: Record<string, string> = {
  '(organic)': '#22c55e',
  '(direct)': '#3b82f6',
  '(referral)': '#a855f7',
  'none': '#64748b',
  '(not set)': '#94a3b8',
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${minutes}m ${secs}s`
}

export function WebTab({ data }: WebTabProps) {
  const [sortBy, setSortBy] = useState<string>("sessions")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  
  const trafficSources = useMemo(() => {
    if (!data || !data.metadata?.trafficSources) return []
    return (data.metadata.trafficSources as GATrafficSource[])
      .sort((a, b) => {
        const aVal = a[sortBy as keyof GATrafficSource]
        const bVal = b[sortBy as keyof GATrafficSource]
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'desc' ? bVal - aVal : aVal - bVal
        }
        return 0
      })
  }, [data, sortBy, sortDir])
  
  const kpis = useMemo(() => {
    if (!trafficSources.length) return {
      totalSessions: 0,
      totalEngaged: 0,
      avgEngagementRate: 0,
      avgEngagementTime: 0,
      totalEvents: 0,
      totalKeyEvents: 0,
    }
    
    return trafficSources.reduce((acc, source) => ({
      totalSessions: acc.totalSessions + source.sessions,
      totalEngaged: acc.totalEngaged + source.engaged_sessions,
      avgEngagementRate: acc.avgEngagementRate + (source.engagement_rate * source.sessions),
      avgEngagementTime: acc.avgEngagementTime + (source.avg_engagement_time * source.sessions),
      totalEvents: acc.totalEvents + source.event_count,
      totalKeyEvents: acc.totalKeyEvents + source.key_events,
    }), {
      totalSessions: 0,
      totalEngaged: 0,
      avgEngagementRate: 0,
      avgEngagementTime: 0,
      totalEvents: 0,
      totalKeyEvents: 0,
    })
  }, [trafficSources])
  
  const finalKpis = useMemo(() => {
    if (kpis.totalSessions === 0) return kpis
    return {
      ...kpis,
      avgEngagementRate: (kpis.avgEngagementRate / kpis.totalSessions) * 100,
      avgEngagementTime: kpis.avgEngagementTime / kpis.totalSessions,
    }
  }, [kpis])
  
  const topChannels = useMemo(() => {
    return trafficSources
      .filter(s => ['(organic)', '(direct)', '(referral)', 'none'].includes(s.campaign))
      .map(s => ({
        name: s.campaign === 'none' ? 'Other' : s.campaign.replace(/[()]/g, ''),
        value: s.sessions,
        color: CHANNEL_COLORS[s.campaign] || '#64748b'
      }))
  }, [trafficSources])
  
  const campaignData = useMemo(() => {
    return trafficSources
      .filter(s => !['(organic)', '(direct)', '(referral)', 'none', '(not set)'].includes(s.campaign))
      .slice(0, 10)
      .map(s => ({
        name: s.campaign.length > 20 ? s.campaign.substring(0, 20) + '...' : s.campaign,
        sessions: s.sessions,
        engaged: s.engaged_sessions,
      }))
  }, [trafficSources])
  
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc")
    } else {
      setSortBy(key)
      setSortDir("desc")
    }
  }
  
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
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Sessions"
          value={formatNumber(finalKpis.totalSessions)}
          subText={`${data.dateRange.start} to ${data.dateRange.end}`}
          icon={<Globe className="w-6 h-6 text-primary" />}
        />
        
        <KPICard
          label="Engaged Sessions"
          value={formatNumber(finalKpis.totalEngaged)}
          subText={`${((finalKpis.totalEngaged / finalKpis.totalSessions) * 100).toFixed(1)}% of total`}
          icon={<Users className="w-6 h-6 text-primary" />}
        />
        
        <KPICard
          label="Avg. Engagement Rate"
          value={`${finalKpis.avgEngagementRate.toFixed(1)}%`}
          subText="User engagement level"
          icon={<Activity className="w-6 h-6 text-primary" />}
        />
        
        <KPICard
          label="Avg. Engagement Time"
          value={formatTime(finalKpis.avgEngagementTime)}
          subText="Time spent on site"
          icon={<MousePointerClick className="w-6 h-6 text-primary" />}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Channels Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Channels</CardTitle>
            <CardDescription>Sessions by acquisition channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topChannels}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topChannels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Campaigns</CardTitle>
            <CardDescription>Sessions by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sessions" fill="#2a5f4a" name="Sessions" />
                <Bar dataKey="engaged" fill="#22c55e" name="Engaged" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Traffic Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
          <CardDescription>Detailed breakdown of all traffic sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-400">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-400">Campaign</th>
                  <th 
                    onClick={() => handleSort("sessions")}
                    className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Sessions
                      {sortBy === "sessions" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("engaged_sessions")}
                    className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Engaged
                      {sortBy === "engaged_sessions" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
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
                  <th className="text-right py-3 px-4 font-semibold text-neutral-400">Avg. Time</th>
                  <th 
                    onClick={() => handleSort("event_count")}
                    className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Events
                      {sortBy === "event_count" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("key_events")}
                    className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Key Events
                      {sortBy === "key_events" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {trafficSources.map((source, idx) => (
                  <tr 
                    key={idx}
                    className={`border-b border-border hover:bg-card-hover transition-colors ${idx % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-900/20' : ''}`}
                  >
                    <td className="py-3 px-4 text-neutral-400">{idx + 1}</td>
                    <td className="py-3 px-4 text-foreground font-medium">{source.campaign}</td>
                    <td className="py-3 px-4 text-right text-foreground font-semibold">{source.sessions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-neutral-400">{source.engaged_sessions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-neutral-400">{(source.engagement_rate * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right text-neutral-400">{formatTime(source.avg_engagement_time)}</td>
                    <td className="py-3 px-4 text-right text-neutral-400">{source.event_count.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-neutral-400">
                      {source.key_events > 0 ? (
                        <span className="text-green-500 font-semibold">{source.key_events}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}