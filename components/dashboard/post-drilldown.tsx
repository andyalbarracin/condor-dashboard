
/**
 * File: post-drilldown.tsx
 * Path: /components/dashboard/post-drilldown.tsx
 * Last Modified: 2025-12-22
 * Description: Panel lateral que muestra todos los posts de un día seleccionado (arreglado para usar metrics en lugar de metadata)
 */

"use client"

import { useEffect, useRef } from "react"
import { X, ExternalLink } from "lucide-react"
import type { DataPoint } from "@/lib/parsers/types"

interface PostDrilldownProps {
  open: boolean
  dateStr: string | null
  posts: DataPoint[]
  onClose: () => void
}

export function PostDrilldown({ open, dateStr, posts, onClose }: PostDrilldownProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open || !posts || posts.length === 0) return null

  const truncate = (text: string, maxLen: number = 197) => {
    if (!text) return ""
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen - 3) + "..."
  }

  const platformColors: Record<string, string> = {
    linkedin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    twitter: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    "google-analytics": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  }

  // Calcular totales del día
  const dayTotals = posts.reduce((acc, post) => {
    Object.entries(post.metrics).forEach(([key, value]) => {
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        acc[key] = (acc[key] || 0) + numValue
      }
    })
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="fixed inset-0 z-50 flex" style={{ pointerEvents: open ? "auto" : "none" }}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm transition-opacity duration-300" style={{ opacity: open ? 1 : 0 }} />
      <aside 
        ref={ref} 
        className={`h-full w-full max-w-[540px] min-w-[400px] flex flex-col bg-card border-l border-border shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`} 
        tabIndex={-1} 
        aria-modal="true" 
        role="dialog"
      >
        {/* Header */}
        <div className="flex flex-col gap-3 px-6 pt-10 pb-5 border-b border-border">
          <button 
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-card-hover transition-colors" 
            onClick={onClose} 
            title="Close"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-foreground">{dateStr}</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {posts.length} post{posts.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Day Totals */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            {['impressions', 'engagements', 'clicks'].map(metric => {
              const value = dayTotals[metric] || 0
              if (value === 0) return null
              return (
                <div key={metric} className="text-center">
                  <div className="text-sm font-bold text-foreground">{value.toLocaleString()}</div>
                  <div className="text-xs text-neutral-500">{metric}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Posts List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {posts.map((post, idx) => {
            // ✅ USAR post.metrics en lugar de post.metadata (igual que top-content-tab.tsx)
            const mainTitle = post.metrics.title && String(post.metrics.title).trim().length > 2
              ? truncate(String(post.metrics.title), 197)
              : post.metrics.content && String(post.metrics.content).trim().length > 2
              ? truncate(String(post.metrics.content), 197)
              : "(No title)"

            const platformColor = platformColors[post.source] || "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
            const postLink = post.metrics.link ? String(post.metrics.link) : null

            // ✅ CONVERTIR MÉTRICAS A NUMBER
            const impressions = Number(post.metrics.impressions) || 0
            const engagements = Number(post.metrics.engagements) || 0
            const clicks = Number(post.metrics.clicks) || 0
            const reactions = Number(post.metrics.reactions || post.metrics.likes) || 0
            const comments = Number(post.metrics.comments) || 0
            const shares = Number(post.metrics.reposts || post.metrics.shares) || 0
            const followersGained = Number(post.metrics.new_followers || post.metrics.followers_gained) || 0
            
            // ✅ NORMALIZAR engagement_rate (igual que en top-content-tab.tsx)
            let engagementRate = Number(post.metrics.engagement_rate) || 0
            
            // Si está en formato 0-1, convertir a 0-100
            if (engagementRate < 1 && engagementRate > 0) {
              engagementRate = engagementRate * 100
            }
            
            // Si no existe o es 0, calcular manualmente
            if (engagementRate === 0 && impressions > 0) {
              engagementRate = (engagements / impressions) * 100
            }

            return (
              <div key={`${post.date}-${idx}`} className="border border-border rounded-lg p-4 bg-background/50 hover:bg-background transition-colors">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${platformColor} shrink-0`}>
                    {post.source === 'twitter' ? 'X' : post.source.charAt(0).toUpperCase() + post.source.slice(1)}
                  </span>
                  {postLink && postLink.startsWith("http") && (
                    <a 
                      href={postLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-auto"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View post
                    </a>
                  )}
                </div>

                {/* Post Title/Content */}
                <h3 className="text-sm font-semibold text-foreground mb-3 leading-tight">
                  {postLink && postLink.startsWith("http") ? (
                    <a 
                      href={postLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline text-primary"
                    >
                      {mainTitle}
                    </a>
                  ) : (
                    mainTitle
                  )}
                </h3>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <MetricBadge label="Impressions" value={impressions} />
                  <MetricBadge label="Engagements" value={engagements} highlight />
                  <MetricBadge label="Clicks" value={clicks} />
                  <MetricBadge label="Reactions" value={reactions} />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <MetricBadge label="Comments" value={comments} />
                  <MetricBadge label="Shares" value={shares} />
                  <MetricBadge label="Eng. Rate" value={`${engagementRate.toFixed(2)}%`} small />
                  {followersGained > 0 && (
                    <MetricBadge label="Followers" value={followersGained} highlight />
                  )}
                </div>

                {/* Performance Badge */}
                {engagementRate > 0 && (
                  <div className="mt-3 flex justify-end">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      engagementRate > 10 
                        ? 'bg-green-500/20 text-green-500' 
                        : engagementRate > 5 
                        ? 'bg-blue-500/20 text-blue-500' 
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {engagementRate > 10 ? 'Excellent' : engagementRate > 5 ? 'Good' : 'Average'}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}

interface MetricBadgeProps {
  label: string
  value: string | number
  highlight?: boolean
  small?: boolean
}

function MetricBadge({ label, value, highlight, small }: MetricBadgeProps) {
  if (value === undefined || value === null || value === 0) return null
  
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value
  
  return (
    <div className={`text-center ${small ? 'py-1' : 'py-2'}`}>
      <div className={`${small ? 'text-xs' : 'text-sm'} font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {formattedValue}
      </div>
      <div className="text-[10px] text-neutral-500">{label}</div>
    </div>
  )
}