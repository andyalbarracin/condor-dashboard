/**
 * File: weekly-summary-calculator.ts
 * Path: /lib/analytics/weekly-summary-calculator.ts
 * Last Modified: 2026-02-02
 * Description: Lógica para calcular weekly summary - usa última semana con datos
 */

import type { ParsedDataset } from "@/lib/parsers/types"

export interface WeeklySummary {
  weekRange: {
    start: string
    end: string
  }
  engagement: {
    total: number
    change: number
    trend: "up" | "down" | "stable"
  }
  topPerformer: {
    title: string
    metric: string
    value: number
    boost: number
  } | null
  underperformer: {
    title: string
    metric: string
    value: number
    drop: number
  } | null
  platformBreakdown: {
    platform: string
    change: number
    trend: "up" | "down" | "stable"
  }[]
  insights: string[]
}

function getTrend(change: number): "up" | "down" | "stable" {
  if (Math.abs(change) < 5) return "stable"
  return change > 0 ? "up" : "down"
}

export function calculateWeeklySummary(
  data: ParsedDataset,
  targetWeekStart?: Date
): WeeklySummary {
  // ⭐ FIX: Encontrar la fecha más reciente en los datos
  const allDates = data.dataPoints.map(p => new Date(p.date).getTime())
  const mostRecentDate = new Date(Math.max(...allDates))
  
  console.log("📊 Most recent date in data:", mostRecentDate.toLocaleDateString())
  
  // Usar la fecha más reciente como "ahora" en lugar del día actual
  const now = targetWeekStart || mostRecentDate
  const weekEnd = new Date(now)
  const weekStart = new Date(now)
  weekStart.setDate(weekEnd.getDate() - 7)

  const prevWeekEnd = new Date(weekStart)
  const prevWeekStart = new Date(prevWeekEnd)
  prevWeekStart.setDate(prevWeekEnd.getDate() - 7)

  console.log("📊 Week range:", weekStart.toLocaleDateString(), "to", weekEnd.toLocaleDateString())

  const currentWeek = data.dataPoints.filter((p) => {
    const date = new Date(p.date)
    return date >= weekStart && date <= weekEnd
  })

  const previousWeek = data.dataPoints.filter((p) => {
    const date = new Date(p.date)
    return date >= prevWeekStart && date < weekStart
  })

  console.log("📊 Current week posts:", currentWeek.length)
  console.log("📊 Previous week posts:", previousWeek.length)

  const currentEngagement = currentWeek.reduce(
    (sum, p) => sum + Number(p.metrics.engagements || 0), 0
  )
  const previousEngagement = previousWeek.reduce(
    (sum, p) => sum + Number(p.metrics.engagements || 0), 0
  )

  console.log("📊 Current engagement:", currentEngagement)
  console.log("📊 Previous engagement:", previousEngagement)

  const engagementChange =
    previousEngagement > 0
      ? ((currentEngagement - previousEngagement) / previousEngagement) * 100
      : 0

  const avgEngagement =
    currentWeek.length > 0
      ? currentWeek.reduce((sum, p) => sum + Number(p.metrics.engagements || 0), 0) /
        currentWeek.length
      : 0

  const topPost = currentWeek
    .filter((p) => p.metrics.title)
    .sort((a, b) => Number(b.metrics.engagements) - Number(a.metrics.engagements))[0]

  const topPerformer = topPost
    ? {
        title: String(topPost.metrics.title).substring(0, 60),
        metric: "engagements",
        value: Number(topPost.metrics.engagements),
        boost:
          avgEngagement > 0
            ? ((Number(topPost.metrics.engagements) - avgEngagement) / avgEngagement) * 100
            : 0,
      }
    : null

  const bottomPost = currentWeek
    .filter((p) => p.metrics.title && Number(p.metrics.engagements) > 0)
    .sort((a, b) => Number(a.metrics.engagements) - Number(b.metrics.engagements))[0]

  const underperformer =
    bottomPost && Number(bottomPost.metrics.engagements) < avgEngagement * 0.5
      ? {
          title: String(bottomPost.metrics.title).substring(0, 60),
          metric: "engagements",
          value: Number(bottomPost.metrics.engagements),
          drop:
            avgEngagement > 0
              ? ((avgEngagement - Number(bottomPost.metrics.engagements)) / avgEngagement) * 100
              : 0,
        }
      : null

  const platforms = ["linkedin", "twitter"]
  const platformBreakdown = platforms
    .map((platform) => {
      const currentPlatform = currentWeek.filter((p) => p.source === platform)
      const prevPlatform = previousWeek.filter((p) => p.source === platform)

      const currentEng = currentPlatform.reduce(
        (sum, p) => sum + Number(p.metrics.engagements || 0), 0
      )
      const prevEng = prevPlatform.reduce(
        (sum, p) => sum + Number(p.metrics.engagements || 0), 0
      )

      const change = prevEng > 0 ? ((currentEng - prevEng) / prevEng) * 100 : 0

      return {
        platform,
        change,
        trend: getTrend(change),
      }
    })
    .filter((p) => p.change !== 0)

  const insights: string[] = []

  if (topPerformer && topPerformer.boost > 50) {
    insights.push(
      `Your post "${topPerformer.title}" outperformed your average by ${topPerformer.boost.toFixed(0)}%`
    )
  }

  if (engagementChange > 5) {
    insights.push(`Your engagement increased by ${engagementChange.toFixed(0)}% this week`)
  } else if (engagementChange < -5) {
    insights.push(
      `Your engagement decreased by ${Math.abs(engagementChange).toFixed(0)}% this week`
    )
  }

  platformBreakdown.forEach((p) => {
    if (Math.abs(p.change) > 15) {
      const platformName = p.platform === "twitter" ? "X" : "LinkedIn"
      insights.push(
        `${platformName} ${p.trend === "up" ? "surged" : "dropped"} by ${Math.abs(p.change).toFixed(0)}%`
      )
    }
  })

  return {
    weekRange: {
      start: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      end: weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    },
    engagement: {
      total: currentEngagement,
      change: engagementChange,
      trend: getTrend(engagementChange),
    },
    topPerformer,
    underperformer,
    platformBreakdown,
    insights,
  }
}