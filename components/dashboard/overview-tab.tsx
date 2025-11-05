"use client"

import { useState } from "react"
import type { ParsedDataset } from "@/lib/parsers/types"
import { EngagementChart, EngagementBarChart } from "./engagement-chart"
import { MetricsSummary } from "./metrics-summary"
import { CalendarHeatmap } from "./calendar-heatmap"
import { PostDrilldown } from "./post-drilldown"

interface OverviewTabProps {
  data: ParsedDataset
  platform: string
  dateRange: string
}

export function OverviewTab({ data, platform, dateRange }: OverviewTabProps) {
  const [selectedPost, setSelectedPost] = useState(null)
  const [showDrilldown, setShowDrilldown] = useState(false)

  const handleCalendarDateClick = (dateStr: string, dayMetrics: Record<string, number>) => {
    // Find the first post for this date
    const post = data.dataPoints.find((p) => p.date === dateStr)
    if (post) {
      setSelectedPost({
        source: post.platform || "Post",
        metrics: {
          title: post.title || post.content || "(No title)",
          content: post.content || post.title || "",
          views: dayMetrics.impressions || 0,
          likes: dayMetrics.likes || 0,
          comments: dayMetrics.comments || 0,
          shares: dayMetrics.shares || 0,
          clicks: dayMetrics.clicks || 0,
          engagements: dayMetrics.engagements || 0,
        },
      })
      setShowDrilldown(true)
    }
  }

  return (
    <>
      <div className="space-y-8">
        <MetricsSummary data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EngagementChart data={data} metric="impressions" />
          </div>
          <div>
            <EngagementBarChart data={data} metric="clicks" />
          </div>
        </div>

        <CalendarHeatmap data={data} platform={platform} dateRange={dateRange} onDateClick={handleCalendarDateClick} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EngagementChart data={data} metric="engagements" />
          <EngagementChart data={data} metric="likes" />
        </div>
      </div>

      <PostDrilldown open={showDrilldown} post={selectedPost} onClose={() => setShowDrilldown(false)} />
    </>
  )
}
