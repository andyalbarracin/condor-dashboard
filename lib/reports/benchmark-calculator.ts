/**
 * File: benchmark-calculator.ts
 * Path: /lib/reports/benchmark-calculator.ts
 * Last Modified: 2025-12-08
 * Description: Multi-industry benchmark support
 */

import type { ParsedDataset } from '@/lib/parsers/types'
import benchmarksData from '@/data/benchmarks.json'

export interface BenchmarkComparison {
  kpi: string
  actual: number
  benchmark: number
  good: number
  excellent: number
  status: 'below' | 'average' | 'good' | 'excellent'
  gap: number
  gapPercentage: number
  description: string
  tooltip: string
  platform: 'linkedin' | 'twitter'
  industryContext: string
  statusMessage: string
  source: string
}

export interface PlatformMetrics {
  platform: 'linkedin' | 'twitter' | 'all'
  totalPosts: number
  totalImpressions: number
  totalEngagements: number
  avgEngagementRate: number
  avgEngagementsPerPost: number
  clickThroughRate: number
  shareRate: number
  commentRate: number
}

// NUEVA FUNCIÓN: Obtener industria del usuario (por ahora hardcoded, después desde DB)
function getUserIndustry(): string {
  // TODO: Obtener de localStorage o DB cuando tengamos onboarding
  const stored = localStorage.getItem('condor_user_industry')
  return stored || benchmarksData.default_industry
}




// NUEVA FUNCIÓN: Obtener KPIs de la industria
function getIndustryKPIs(industryKey: string) {
  const industries = benchmarksData.industries as Record<string, any>
  return industries[industryKey] || industries[benchmarksData.default_industry]
}

export function extractPlatformMetrics(data: ParsedDataset, platform: 'linkedin' | 'twitter' | 'all'): PlatformMetrics {
  let posts = data.dataPoints
  
  if (platform !== 'all') {
    posts = posts.filter(p => p.source === platform)
  }
  
  const totalPosts = posts.length
  const totalImpressions = posts.reduce((sum, p) => sum + Number(p.metrics.impressions || 0), 0)
  const totalEngagements = posts.reduce((sum, p) => sum + Number(p.metrics.engagements || 0), 0)
  const totalClicks = posts.reduce((sum, p) => sum + Number(p.metrics.clicks || 0), 0)
  const totalShares = posts.reduce((sum, p) => sum + Number(p.metrics.reposts || p.metrics.shares || 0), 0)
  const totalComments = posts.reduce((sum, p) => sum + Number(p.metrics.comments || 0), 0)
  
  const engagementRates = posts.map(p => {
    let rate = Number(p.metrics.engagement_rate || 0)
    if (rate < 1 && rate > 0) {
      rate = rate * 100
    }
    return rate
  })
  
  const avgEngagementRate = totalPosts > 0 
    ? (engagementRates.reduce((sum, rate) => sum + rate, 0) / totalPosts) / 100
    : 0
  
  return {
    platform,
    totalPosts,
    totalImpressions,
    totalEngagements,
    avgEngagementRate,
    avgEngagementsPerPost: totalPosts > 0 ? (totalEngagements / totalPosts) : 0,
    clickThroughRate: totalImpressions > 0 ? (totalClicks / totalImpressions) : 0,
    shareRate: totalImpressions > 0 ? (totalShares / totalImpressions) : 0,
    commentRate: totalImpressions > 0 ? (totalComments / totalImpressions) : 0,
  }
}

function getStatusMessage(status: string): string {
  const messages = benchmarksData.status_messages as Record<string, string>
  return messages[status] || messages.below
}

export function compareEngagementRate(metrics: PlatformMetrics): BenchmarkComparison {
  const platform: 'linkedin' | 'twitter' = metrics.platform === 'all' ? 'linkedin' : metrics.platform as 'linkedin' | 'twitter'
  
  const industryKey = getUserIndustry()
  const industryData = getIndustryKPIs(industryKey)
  
  const kpiName = platform === 'linkedin' ? 'engagement_rate_linkedin' : 'engagement_rate_x'
  const kpiData = industryData.kpis.find((k: any) => k.name === kpiName)
  
  if (!kpiData) {
    throw new Error(`KPI ${kpiName} not found for industry ${industryKey}`)
  }
  
  const actual = metrics.avgEngagementRate
  const benchmark = kpiData.benchmark.industry_avg || 0
  const good = kpiData.benchmark.good || 0
  const excellent = kpiData.benchmark.excellent || 0
  
  let status: 'below' | 'average' | 'good' | 'excellent' = 'below'
  if (actual >= excellent) status = 'excellent'
  else if (actual >= good) status = 'good'
  else if (actual >= benchmark) status = 'average'
  
  const gap = benchmark - actual
  const gapPercentage = benchmark > 0 ? (gap / benchmark) * 100 : 0
  
  return {
    kpi: kpiData.label,
    actual,
    benchmark,
    good,
    excellent,
    status,
    gap,
    gapPercentage,
    description: kpiData.description,
    tooltip: kpiData.tooltip,
    platform,
    industryContext: industryData.name,
    statusMessage: getStatusMessage(status),
    source: kpiData.source,
  }
}

export function compareAvgEngagementsPerPost(metrics: PlatformMetrics): BenchmarkComparison {
  const platform: 'linkedin' | 'twitter' = metrics.platform === 'all' ? 'linkedin' : metrics.platform as 'linkedin' | 'twitter'
  
  const industryKey = getUserIndustry()
  const industryData = getIndustryKPIs(industryKey)
  
  const kpiData = industryData.kpis.find((k: any) => k.name === 'avg_engagement_per_post')
  
  if (!kpiData) {
    throw new Error('avg_engagement_per_post not found')
  }
  
  const actual = metrics.avgEngagementsPerPost
  
  const benchmark = platform === 'linkedin' 
    ? kpiData.benchmark.linkedin_industry_avg 
    : kpiData.benchmark.x_industry_avg
  const good = platform === 'linkedin' 
    ? kpiData.benchmark.linkedin_good 
    : kpiData.benchmark.x_good
  const excellent = platform === 'linkedin' 
    ? kpiData.benchmark.linkedin_excellent 
    : kpiData.benchmark.x_excellent
  
  let status: 'below' | 'average' | 'good' | 'excellent' = 'below'
  if (actual >= excellent) status = 'excellent'
  else if (actual >= good) status = 'good'
  else if (actual >= benchmark) status = 'average'
  
  const gap = benchmark - actual
  const gapPercentage = benchmark > 0 ? (gap / benchmark) * 100 : 0
  
  return {
    kpi: `${kpiData.label} (${platform === 'linkedin' ? 'LinkedIn' : 'X'})`,
    actual,
    benchmark,
    good,
    excellent,
    status,
    gap,
    gapPercentage,
    description: kpiData.description,
    tooltip: kpiData.tooltip,
    platform,
    industryContext: industryData.name,
    statusMessage: getStatusMessage(status),
    source: kpiData.source || 'Industry benchmarks',
  }
}

export function compareClickThroughRate(metrics: PlatformMetrics): BenchmarkComparison {
  const platform: 'linkedin' | 'twitter' = metrics.platform === 'all' ? 'linkedin' : metrics.platform as 'linkedin' | 'twitter'
  
  const industryKey = getUserIndustry()
  const industryData = getIndustryKPIs(industryKey)
  
  const kpiData = industryData.kpis.find((k: any) => k.name === 'click_through_rate')
  
  if (!kpiData) {
    throw new Error('click_through_rate not found')
  }
  
  const actual = metrics.clickThroughRate
  
  const benchmark = platform === 'linkedin'
    ? kpiData.benchmark.linkedin_industry_avg
    : kpiData.benchmark.x_industry_avg
  const good = platform === 'linkedin'
    ? kpiData.benchmark.linkedin_good
    : kpiData.benchmark.x_good
  const excellent = platform === 'linkedin'
    ? kpiData.benchmark.linkedin_excellent
    : kpiData.benchmark.x_excellent
  
  let status: 'below' | 'average' | 'good' | 'excellent' = 'below'
  if (actual >= excellent) status = 'excellent'
  else if (actual >= good) status = 'good'
  else if (actual >= benchmark) status = 'average'
  
  const gap = benchmark - actual
  const gapPercentage = benchmark > 0 ? (gap / benchmark) * 100 : 0
  
  return {
    kpi: `${kpiData.label} (${platform === 'linkedin' ? 'LinkedIn' : 'X'})`,
    actual,
    benchmark,
    good,
    excellent,
    status,
    gap,
    gapPercentage,
    description: kpiData.description,
    tooltip: kpiData.tooltip,
    platform,
    industryContext: industryData.name,
    statusMessage: getStatusMessage(status),
    source: kpiData.source || 'Industry benchmarks',
  }
}

export function generateAllComparisons(data: ParsedDataset): {
  linkedin: BenchmarkComparison[]
  twitter: BenchmarkComparison[]
} {
  const linkedinMetrics = extractPlatformMetrics(data, 'linkedin')
  const twitterMetrics = extractPlatformMetrics(data, 'twitter')
  
  return {
    linkedin: [
      compareEngagementRate(linkedinMetrics),
      compareAvgEngagementsPerPost(linkedinMetrics),
      compareClickThroughRate(linkedinMetrics),
    ],
    twitter: [
      compareEngagementRate(twitterMetrics),
      compareAvgEngagementsPerPost(twitterMetrics),
      compareClickThroughRate(twitterMetrics),
    ],
  }
}

export function generateRecommendations(comparisons: BenchmarkComparison[]): string[] {
  const recommendations: string[] = []
  
  comparisons.forEach(comp => {
    if (comp.status === 'below') {
      if (comp.kpi.includes('Engagement Rate')) {
        recommendations.push(`Increase ${comp.kpi} by ${Math.abs(comp.gapPercentage).toFixed(1)}% to reach industry average. Focus on interactive content and audience engagement.`)
      } else if (comp.kpi.includes('Avg Engagements')) {
        recommendations.push(`Boost ${comp.kpi} to reach ${comp.benchmark.toFixed(0)} engagements per post. Post more engaging content formats (videos, carousels, polls).`)
      } else if (comp.kpi.includes('Click-Through')) {
        recommendations.push(`Improve ${comp.kpi} by optimizing CTAs and link placement. Current: ${(comp.actual * 100).toFixed(2)}%, Target: ${(comp.benchmark * 100).toFixed(2)}%.`)
      }
    } else if (comp.status === 'average') {
      if (comp.kpi.includes('Engagement Rate')) {
        recommendations.push(`${comp.kpi} is at industry average. Push towards "good" benchmark (${(comp.good * 100).toFixed(2)}%) with A/B testing.`)
      } else if (comp.kpi.includes('Avg Engagements')) {
        recommendations.push(`${comp.kpi} is at industry average. Aim for ${comp.good.toFixed(0)} engagements per post with better content quality.`)
      }
    }
  })
  
  return recommendations
}

// NUEVA FUNCIÓN: Get available industries
export function getAvailableIndustries() {
  const industries = benchmarksData.industries as Record<string, any>
  return Object.entries(industries).map(([key, data]) => ({
    key,
    name: data.name,
    description: data.description,
  }))
}