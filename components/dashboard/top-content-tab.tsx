"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react"
import type { ParsedDataset } from "@/lib/parsers/types"

interface TopContentTabProps {
  data: ParsedDataset
  platform: string
  onRowClick?: (post: any) => void
}

function normalizePlatform(platform: string): string {
  const normalized = platform.toLowerCase()
  if (normalized === 'x') return 'twitter'
  return normalized
}

export function TopContentTab({ data, platform, onRowClick }: TopContentTabProps) {
  const [sortBy, setSortBy] = useState("engagements")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  let posts = data.dataPoints.filter((r) => r.metrics.title && String(r.metrics.title).toString().trim().length > 2)

  if (platform !== "All") {
    const normalizedFilter = normalizePlatform(platform)
    posts = posts.filter(p => p.source.toLowerCase() === normalizedFilter)
  }

  const sorted = [...posts].sort((a, b) => {
    let vA = Number(a.metrics[sortBy]) || 0
    let vB = Number(b.metrics[sortBy]) || 0

    if (sortBy === "date") {
      vA = new Date(a.date).getTime()
      vB = new Date(b.date).getTime()
    }

    return sortDir === "desc" ? vB - vA : vA - vB
  })

  const totalPages = Math.ceil(sorted.length / rowsPerPage)
  const paged = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const headers = [
    { key: "title", label: "Title" },
    { key: "source", label: "Platform" },
    { key: "date", label: "Date" },
    { key: "engagements", label: "Engagements" },
    { key: "impressions", label: "Impressions" },
    { key: "clicks", label: "Clicks" },
  ]

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Top Content</h3>
        <p className="text-sm text-neutral-500">
          Showing {posts.length} post{posts.length !== 1 ? 's' : ''} 
          {platform !== "All" && ` from ${platform}`}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => {
                    if (h.key !== "source") {
                      if (sortBy === h.key) {
                        setSortDir(sortDir === "desc" ? "asc" : "desc")
                      } else {
                        setSortBy(h.key)
                        setSortDir("desc")
                      }
                    }
                  }}
                  className={`text-left py-3 px-4 font-semibold text-neutral-400 ${h.key !== "source" ? "cursor-pointer hover:text-foreground" : ""} transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    {h.label}
                    {sortBy === h.key && (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center py-8 text-neutral-400">
                  No posts to display{platform !== "All" && ` for ${platform}`}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => {
                const postLink = String(row.metrics.link || '')
                const postTitle = String(row.metrics.title || "(No title)")
                
                return (
                  <tr key={i} onClick={() => onRowClick?.(row)} className="border-b border-border hover:bg-card-hover cursor-pointer transition-colors">
                    <td className="py-3 px-4 text-foreground truncate max-w-xs">
                      {postLink ? (
                        <a href={postLink} target="_blank" rel="noopener noreferrer" onClick={(e: React.MouseEvent) => e.stopPropagation()} className="flex items-center gap-1 hover:underline text-primary">
                          {postTitle}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        postTitle
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${row.source === 'linkedin' ? 'bg-blue-500/20 text-blue-400' : row.source === 'twitter' ? 'bg-sky-500/20 text-sky-400' : 'bg-neutral-500/20 text-neutral-400'}`}>
                        {row.source === 'twitter' ? 'X' : row.source.charAt(0).toUpperCase() + row.source.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-400">{row.date}</td>
                    <td className="py-3 px-4 text-neutral-400">{Number(row.metrics.engagements).toLocaleString() || "-"}</td>
                    <td className="py-3 px-4 text-neutral-400">{Number(row.metrics.impressions).toLocaleString() || "-"}</td>
                    <td className="py-3 px-4 text-neutral-400">{Number(row.metrics.clicks).toLocaleString() || "-"}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded text-sm font-medium bg-card border border-border text-foreground hover:bg-accent disabled:opacity-50">
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded text-sm font-medium bg-card border border-border text-foreground hover:bg-accent disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  )
}