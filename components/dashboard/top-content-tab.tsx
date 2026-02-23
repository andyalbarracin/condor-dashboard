/**
 * File: top-content-tab.tsx
 * Path: /components/dashboard/top-content-tab.tsx
 * Last Modified: 2026-02-02
 * Description: Top Content con tooltips en headers
 */

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronUp, ChevronDown } from "lucide-react"
import { MetricTooltipIcon } from "@/components/ui/metric-tooltip"
import { getMetricTooltip } from "@/lib/constants/metric-tooltips"
import type { ParsedDataset } from "@/lib/parsers/types"

interface TopContentTabProps {
  data: ParsedDataset
  platform: string
}

function normalizePlatform(platform: string): string {
  const normalized = platform.toLowerCase()
  if (normalized === 'x') return 'twitter'
  return normalized
}

export function TopContentTab({ data, platform }: TopContentTabProps) {
  const [sortBy, setSortBy] = useState<string>("engagements")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [rowsPerPage, setRowsPerPage] = useState<number>(20)
  
  const topContent = useMemo(() => {
    let filteredPoints = data.dataPoints
    
    if (platform !== "All") {
      const normalizedFilter = normalizePlatform(platform)
      filteredPoints = filteredPoints.filter(p => 
        p.source.toLowerCase() === normalizedFilter
      )
    }
    
    const validPosts = filteredPoints.filter(p => {
      const hasContent = p.metrics.title || p.metrics.content || p.metrics.post_text
      return hasContent && hasContent.toString().trim().length > 0
    })
    
    let posts = validPosts.map((p, index) => {
      let engRate = Number(p.metrics.engagement_rate || 0)
      
      if (engRate < 1 && engRate > 0) {
        engRate = engRate * 100
      }
      
      return {
        id: p.id || `${p.date}-${p.source}-${index}`,
        title: String(p.metrics.title || p.metrics.post_text || ''),
        source: p.source,
        date: p.date,
        link: String(p.metrics.link || ''),
        impressions: Number(p.metrics.impressions || 0),
        engagements: Number(p.metrics.engagements || 0),
        clicks: Number(p.metrics.clicks || 0),
        reactions: Number(p.metrics.reactions || p.metrics.likes || 0),
        comments: Number(p.metrics.comments || 0),
        shares: Number(p.metrics.reposts || p.metrics.shares || 0),
        engagement_rate: engRate,
      }
    })
    
    posts.sort((a, b) => {
      let vA = a[sortBy as keyof typeof a]
      let vB = b[sortBy as keyof typeof b]
      
      if (sortBy === "date") {
        vA = new Date(a.date).getTime()
        vB = new Date(b.date).getTime()
      }
      
      if (typeof vA === 'number' && typeof vB === 'number') {
        return sortDir === "desc" ? vB - vA : vA - vB
      }
      
      return 0
    })
    
    return rowsPerPage === 999 ? posts : posts.slice(0, rowsPerPage)
  }, [data, platform, sortBy, sortDir, rowsPerPage])
  
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc")
    } else {
      setSortBy(key)
      setSortDir("desc")
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Content</CardTitle>
            <CardDescription>Best performing posts</CardDescription>
          </div>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="px-3 py-1.5 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={20}>Show 20</option>
            <option value={30}>Show 30</option>
            <option value={50}>Show 50</option>
            <option value={999}>Show All</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-neutral-400">#</th>
                <th 
                  onClick={() => handleSort("title")}
                  className="text-left py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Title
                    {sortBy === "title" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-400">Platform</th>
                <th 
                  onClick={() => handleSort("date")}
                  className="text-left py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Date
                    {sortBy === "date" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("impressions")}
                  className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    Impressions
                    {getMetricTooltip("impressions") && <MetricTooltipIcon metric={getMetricTooltip("impressions")!} size="sm" />}
                    {sortBy === "impressions" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("engagements")}
                  className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    Engagements
                    {getMetricTooltip("engagements") && <MetricTooltipIcon metric={getMetricTooltip("engagements")!} size="sm" />}
                    {sortBy === "engagements" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("clicks")}
                  className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    Clicks
                    {getMetricTooltip("clicks") && <MetricTooltipIcon metric={getMetricTooltip("clicks")!} size="sm" />}
                    {sortBy === "clicks" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("reactions")}
                  className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    Reactions
                    {getMetricTooltip("reactions") && <MetricTooltipIcon metric={getMetricTooltip("reactions")!} size="sm" />}
                    {sortBy === "reactions" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("comments")}
                  className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    Comments
                    {getMetricTooltip("comments") && <MetricTooltipIcon metric={getMetricTooltip("comments")!} size="sm" />}
                    {sortBy === "comments" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("shares")}
                  className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    Shares
                    {getMetricTooltip("shares") && <MetricTooltipIcon metric={getMetricTooltip("shares")!} size="sm" />}
                    {sortBy === "shares" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("engagement_rate")}
                  className="text-right py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    Eng. Rate
                    {getMetricTooltip("engagement_rate") && <MetricTooltipIcon metric={getMetricTooltip("engagement_rate")!} size="sm" />}
                    {sortBy === "engagement_rate" && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {topContent.map((post, idx) => (
                <tr 
                  key={post.id}
                  className={`border-b border-border hover:bg-card-hover transition-colors ${idx % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-900/20' : ''}`}
                >
                  <td className="py-3 px-4 text-neutral-400">{idx + 1}</td>
                  <td className="py-3 px-4 text-foreground max-w-xs truncate">
                    {post.link ? (
                      <a 
                        href={post.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-primary"
                      >
                        {post.title}
                      </a>
                    ) : (
                      post.title
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      post.source === 'linkedin' ? 'bg-blue-500/20 text-blue-400' :
                      post.source === 'twitter' ? 'bg-sky-500/20 text-sky-400' :
                      'bg-neutral-500/20 text-neutral-400'
                    }`}>
                      {post.source === 'twitter' ? 'X' : post.source.charAt(0).toUpperCase() + post.source.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-400">{post.date}</td>
                  <td className="py-3 px-4 text-right text-neutral-400">{post.impressions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-neutral-400 font-semibold">{post.engagements.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-neutral-400">{post.clicks.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-neutral-400">{post.reactions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-neutral-400">{post.comments.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-neutral-400">{post.shares.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-neutral-400">{post.engagement_rate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}