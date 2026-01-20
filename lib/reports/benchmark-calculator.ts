/**
 * File: benchmark-calculator.ts
 * Path: /lib/reports/benchmark-calculator.ts
 * Last Modified: 2026-01-19
 * Description: Multi-industry benchmark + Intelligent Recommendations - CORREGIDO
 */

import type { ParsedDataset } from '@/lib/parsers/types'
import benchmarksData from '@/data/benchmarks.json'
import { analyzeContentPatterns } from './content-analyzer'

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

export interface IntelligentRecommendation {
  priority: 'high' | 'medium' | 'low'
  category: 'content_type' | 'posting_schedule' | 'engagement_tactics' | 'improvement'
  title: string
  description: string
  data_source: string
  actionable_steps?: string[]
}

function getUserIndustry(): string {
  if (typeof window === 'undefined') return benchmarksData.default_industry
  const stored = localStorage.getItem('condor_user_industry')
  return stored || benchmarksData.default_industry
}

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

export function generateIntelligentRecommendations(
  data: ParsedDataset,
  comparisons: BenchmarkComparison[]
): IntelligentRecommendation[] {
  const recommendations: IntelligentRecommendation[] = []

  const linkedinPosts = data.dataPoints.filter(p => p.source === 'linkedin')
  
  if (linkedinPosts.length < 3) {
    return []
  }

  const contentAnalysis = analyzeContentPatterns(linkedinPosts)

  if (contentAnalysis.patterns.length > 0) {
    const topPattern = contentAnalysis.patterns[0]
    
    recommendations.push({
      priority: 'high',
      category: 'content_type',
      title: `${topPattern.name} performs ${topPattern.improvement_vs_avg.toFixed(0)}% better`,
      description: `Your ${topPattern.name.toLowerCase()} posts generate significantly higher engagement. ` +
        `Example: "${topPattern.examples[0]}"`,
      data_source: `Based on ${topPattern.posts_matching} posts with ${topPattern.avg_engagement_rate.toFixed(1)}% avg engagement rate`,
      actionable_steps: [
        `Create 2-3 more ${topPattern.name.toLowerCase()} posts per week`,
        `Use similar framing to your top post: "${topPattern.examples[0].substring(0, 50)}..."`,
        `Test variations of this format to find what resonates most`
      ]
    })
  }

  if (contentAnalysis.best_posting_days.length > 0) {
    const bestDay = contentAnalysis.best_posting_days[0]
    const worstDay = contentAnalysis.best_posting_days[contentAnalysis.best_posting_days.length - 1]
    
    recommendations.push({
      priority: 'high',
      category: 'posting_schedule',
      title: `Post on ${bestDay.day}s for ${bestDay.avg_engagement_rate.toFixed(1)}% engagement`,
      description: `${bestDay.day}s outperform ${worstDay.day}s by ${((bestDay.avg_engagement_rate / worstDay.avg_engagement_rate - 1) * 100).toFixed(0)}%. ` +
        `Schedule your most important content for ${bestDay.day}s.`,
      data_source: `Based on ${bestDay.post_count} ${bestDay.day} posts`,
      actionable_steps: [
        `Schedule 60% of posts on ${bestDay.day}s`,
        `Post your highest-value content on ${bestDay.day} mornings`,
        `Avoid posting on ${worstDay.day}s unless necessary`
      ]
    })
  }

  comparisons.forEach(comp => {
    if (comp.status === 'below' && comp.gap > 0) {
      const isAvgEngagements = comp.kpi.includes('Avg Engagements')
      
      if (isAvgEngagements) {
        recommendations.push({
          priority: 'medium',
          category: 'improvement',
          title: `Boost ${comp.kpi} to ${comp.benchmark.toFixed(0)} engagements`,
          description: `Currently at ${comp.actual.toFixed(1)} engagements per post. ` +
            `Need ${comp.gap.toFixed(1)} more engagements per post to reach industry average.`,
          data_source: `Industry benchmark: ${comp.benchmark} engagements`,
          actionable_steps: [
            'Add clear CTAs to each post (ask questions, invite comments)',
            'Tag relevant people/companies to increase visibility',
            'Use engaging formats: carousels, documents, or polls',
            'Respond to every comment within 2 hours to boost algorithm'
          ]
        })
      } else if (comp.gapPercentage > 10) {
        recommendations.push({
          priority: 'medium',
          category: 'improvement',
          title: `Improve ${comp.kpi} by ${Math.abs(comp.gapPercentage).toFixed(0)}%`,
          description: `Current: ${(comp.actual * 100).toFixed(2)}%, Target: ${(comp.benchmark * 100).toFixed(2)}%`,
          data_source: `Industry benchmark`,
          actionable_steps: [
            'Focus on audience pain points and challenges',
            'Share actionable insights, not just product features',
            'Include data/statistics to add credibility'
          ]
        })
      }
    }
  })

  if (contentAnalysis.specific_tactics.length > 0) {
    contentAnalysis.specific_tactics.forEach(tactic => {
      recommendations.push({
        priority: 'low',
        category: 'engagement_tactics',
        title: 'Data-driven tactic',
        description: tactic,
        data_source: 'Top performing posts analysis'
      })
    })
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations.slice(0, 8)
}

export function getAvailableIndustries() {
  const industries = benchmarksData.industries as Record<string, any>
  return Object.entries(industries).map(([key, data]) => ({
    key,
    name: data.name,
    description: data.description,
  }))
}