/**
 * File: web-summary-calculator.ts
 * Path: /lib/analytics/web-summary-calculator.ts
 * Last Modified: 2026-03-21
 * Description: Calculates web analytics summary from GA4 UTM campaign data.
 *              Unlike social summary, GA4 data is aggregated (not daily),
 *              so comparisons are based on distribution, not time periods.
 */

import type { ParsedDataset } from "@/lib/parsers/types"
import type { GAUTMCampaign } from "@/lib/parsers/google-analytics-parser"

export interface WebSummary {
  dateRange: {
    start: string
    end: string
  }
  totalSessions: number
  campaignCount: number
  topSource: { name: string; sessions: number; pct: number } | null
  topMedium: { name: string; sessions: number; pct: number } | null
  topCampaign: { name: string; sourceMedium: string; sessions: number; pct: number } | null
  mediumBreakdown: { medium: string; sessions: number; pct: number; color: string }[]
  topCampaigns: { name: string; sourceMedium: string; sessions: number; pct: number }[]
  insights: string[]
}

const MEDIUM_COLORS: Record<string, string> = {
  'organic': '#22c55e',
  'direct': '#3b82f6',
  '(none)': '#3b82f6',
  'referral': '#a855f7',
  'website': '#8b5cf6',
  'post': '#0ea5e9',
  'email': '#f97316',
  'social': '#ec4899',
  '(not set)': '#94a3b8',
}

export function calculateWebSummary(data: ParsedDataset): WebSummary | null {
  const campaigns = data.metadata?.utmCampaigns as GAUTMCampaign[] | undefined
  if (!campaigns || campaigns.length === 0) return null

  const totalSessions = campaigns.reduce((sum, c) => sum + c.sessions, 0)
  if (totalSessions === 0) return null

  // Group by source
  const bySource: Record<string, number> = {}
  campaigns.forEach(c => {
    bySource[c.source] = (bySource[c.source] || 0) + c.sessions
  })
  const sortedSources = Object.entries(bySource).sort((a, b) => b[1] - a[1])
  const topSource = sortedSources[0]
    ? { name: sortedSources[0][0], sessions: sortedSources[0][1], pct: (sortedSources[0][1] / totalSessions) * 100 }
    : null

  // Group by medium
  const byMedium: Record<string, number> = {}
  campaigns.forEach(c => {
    let medium = c.medium || '(not set)'
    if (medium === '(none)') medium = 'direct'
    byMedium[medium] = (byMedium[medium] || 0) + c.sessions
  })
  const sortedMediums = Object.entries(byMedium).sort((a, b) => b[1] - a[1])
  const topMedium = sortedMediums[0]
    ? { name: sortedMediums[0][0], sessions: sortedMediums[0][1], pct: (sortedMediums[0][1] / totalSessions) * 100 }
    : null

  const mediumBreakdown = sortedMediums.map(([medium, sessions]) => ({
    medium: medium.charAt(0).toUpperCase() + medium.slice(1),
    sessions,
    pct: (sessions / totalSessions) * 100,
    color: MEDIUM_COLORS[medium.toLowerCase()] || '#64748b',
  }))

  // Top campaigns (excluding (direct)/(none) and (not set))
  const meaningfulCampaigns = campaigns
    .filter(c => c.campaign !== '(direct)' && c.campaign !== '(not set)')
    .sort((a, b) => b.sessions - a.sessions)

  const topCampaigns = meaningfulCampaigns.slice(0, 5).map(c => ({
    name: c.campaign,
    sourceMedium: c.source_medium,
    sessions: c.sessions,
    pct: (c.sessions / totalSessions) * 100,
  }))

  const topCampaign = topCampaigns[0] || null

  // Generate insights
  const insights: string[] = []

  if (topSource && topSource.pct > 40) {
    const sourceName = topSource.name === '(direct)' ? 'Direct traffic' : topSource.name.charAt(0).toUpperCase() + topSource.name.slice(1)
    insights.push(`${sourceName} drives ${topSource.pct.toFixed(0)}% of your total sessions`)
  }

  const organicSessions = byMedium['organic'] || 0
  const organicPct = (organicSessions / totalSessions) * 100
  if (organicPct > 20) {
    insights.push(`Strong organic presence: ${organicPct.toFixed(0)}% of traffic comes from search engines`)
  } else if (organicPct < 5 && totalSessions > 50) {
    insights.push(`Low organic traffic (${organicPct.toFixed(0)}%) — consider investing in SEO`)
  }

  const postSessions = byMedium['post'] || 0
  const socialSessions = byMedium['social'] || 0
  const socialTotal = postSessions + socialSessions
  if (socialTotal > 0) {
    insights.push(`Social media campaigns brought ${socialTotal.toLocaleString()} sessions (${((socialTotal / totalSessions) * 100).toFixed(0)}%)`)
  }

  if (meaningfulCampaigns.length > 0 && topCampaign) {
    insights.push(`Top campaign "${topCampaign.name}" generated ${topCampaign.sessions} sessions`)
  }

  const directPct = ((byMedium['direct'] || 0) / totalSessions) * 100
  if (directPct > 50) {
    insights.push(`${directPct.toFixed(0)}% of traffic is direct — consider adding UTM parameters to track campaigns better`)
  }

  return {
    dateRange: { start: data.dateRange.start, end: data.dateRange.end },
    totalSessions,
    campaignCount: campaigns.length,
    topSource,
    topMedium,
    topCampaign,
    mediumBreakdown,
    topCampaigns,
    insights,
  }
}