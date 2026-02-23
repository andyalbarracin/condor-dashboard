/**
 * File: followers-growth-card.tsx
 * Path: /components/dashboard/followers-growth-card.tsx
 * Last Modified: 2026-02-02
 * Description: Card descriptiva de crecimiento de followers con tooltip
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp } from "lucide-react"
import { MetricTooltipIcon } from "@/components/ui/metric-tooltip"
import { getMetricTooltip } from "@/lib/constants/metric-tooltips"

interface FollowersGrowthCardProps {
  totalGained: number
  organicGained: number
  sponsoredGained: number
  startCount: number
  endCount: number
  startDate: string
  endDate: string
  growthRate: number
}

export function FollowersGrowthCard({
  totalGained,
  organicGained,
  sponsoredGained,
  startCount,
  endCount,
  startDate,
  endDate,
  growthRate
}: FollowersGrowthCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const followersTooltip = getMetricTooltip("followers_gained")

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle>Followers Growth Analysis</CardTitle>
              {followersTooltip && <MetricTooltipIcon metric={followersTooltip} size="md" />}
            </div>
            <CardDescription>LinkedIn follower metrics for this period</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-foreground">
          <p className="text-base leading-relaxed">
            You gained <span className="font-bold text-primary text-lg">{totalGained.toLocaleString()} new followers</span> between{' '}
            <span className="font-semibold">{formatDate(startDate)}</span> and{' '}
            <span className="font-semibold">{formatDate(endDate)}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-medium text-neutral-500 uppercase">Total Followers</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{endCount.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {startCount > 0 ? `from ${startCount.toLocaleString()} (+${((totalGained / startCount) * 100).toFixed(1)}%)` : 'New followers gained'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-500 uppercase">Organic</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{organicGained.toLocaleString()}</p>
            <p className="text-xs text-green-500/70 mt-1">
              {totalGained > 0 ? `${((organicGained / totalGained) * 100).toFixed(0)}% of total growth` : '0% of total'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-medium text-blue-500 uppercase">Sponsored</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{sponsoredGained.toLocaleString()}</p>
            <p className="text-xs text-blue-500/70 mt-1">
              {totalGained > 0 ? `${((sponsoredGained / totalGained) * 100).toFixed(0)}% of total growth` : '0% of total'}
            </p>
          </div>
        </div>

        {startCount > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Growth rate in this period:</span>
              <span className="text-lg font-bold text-primary">
                {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}