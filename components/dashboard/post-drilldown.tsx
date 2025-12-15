"use client"

import { useEffect, useRef } from "react"
import { X, ExternalLink } from "lucide-react"

interface PostDrilldownProps {
  open: boolean
  post: {
    id?: string
    title: string
    content?: string
    link?: string
    date: string
    source: string
    impressions: number
    engagements: number
    reactions: number
    comments: number
    shares: number
    clicks: number
    engagement_rate: number
    followers_gained?: number
  } | null
  onClose: () => void
}

export function PostDrilldown({ open, post, onClose }: PostDrilldownProps) {
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

  if (!open || !post) return null

  const truncate = (text: string, maxLen: number = 197) => {
    if (!text) return ""
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen - 3) + "..."
  }

  const mainTitle = post.title && post.title.trim().length > 2
    ? truncate(post.title, 197)
    : post.content && post.content.trim().length > 2
    ? truncate(post.content, 197)
    : "(No title)"

  const platformColors: Record<string, string> = {
    linkedin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    twitter: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  }

  const platformColor = platformColors[post.source] || "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"

  return (
    <div className="fixed inset-0 z-50 flex" style={{ pointerEvents: open ? "auto" : "none" }}>
      <div className="flex-1 bg-black/30 backdrop-blur-sm transition-opacity duration-300" style={{ opacity: open ? 1 : 0 }} />
      <aside ref={ref} className={`h-full w-full max-w-[480px] min-w-[360px] flex flex-col bg-card border-l border-border shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`} tabIndex={-1} aria-modal="true" role="dialog">
        <button className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:bg-card-hover transition-colors" onClick={onClose} title="Close">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex flex-col gap-3 px-6 pt-10 pb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${platformColor}`}>
              {post.source === 'twitter' ? 'X' : post.source.charAt(0).toUpperCase() + post.source.slice(1)}
            </span>
            <span className="text-xs text-neutral-500">{post.date}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground break-words leading-tight">{mainTitle}</h2>
          {post.link && post.link.startsWith("http") && (
            <a href={post.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink className="w-4 h-4" />
              View original post
            </a>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {post.content && post.content !== post.title && (
            <div className="mb-6 text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
              {truncate(post.content, 400)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <MetricCard label="Impressions" value={post.impressions} />
            <MetricCard label="Engagements" value={post.engagements} />
            <MetricCard label="Reactions" value={post.reactions} />
            <MetricCard label="Comments" value={post.comments} />
            <MetricCard label="Shares" value={post.shares} />
            <MetricCard label="Clicks" value={post.clicks} />
            <MetricCard label="Engagement Rate" value={`${post.engagement_rate.toFixed(2)}%`} />
            {post.followers_gained !== undefined && post.followers_gained > 0 && (
              <MetricCard label="Followers Gained" value={post.followers_gained} highlight />
            )}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Performance</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${post.engagement_rate > 5 ? 'bg-green-500/20 text-green-500' : post.engagement_rate > 2 ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                {post.engagement_rate > 5 ? 'Excellent' : post.engagement_rate > 2 ? 'Good' : 'Average'}
              </span>
            </div>
            <p className="text-xs text-foreground/60">
              This post generated {post.engagements.toLocaleString()} engagements from {post.impressions.toLocaleString()} impressions
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  highlight?: boolean
}

function MetricCard({ label, value, highlight }: MetricCardProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-lg border ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-card-hover border-border'}`}>
      <span className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{formattedValue}</span>
      <span className="text-xs text-neutral-500 mt-1">{label}</span>
    </div>
  )
}