"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import type { ParsedDataset } from "@/lib/parsers/types"

interface TopContentTabProps {
  data: ParsedDataset
  platform: string
  onRowClick?: (post: any) => void
}

export function TopContentTab({ data, platform, onRowClick }: TopContentTabProps) {
  const [sortBy, setSortBy] = useState("engagements")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  const posts = data.dataPoints.filter((r) => r.metrics.title && String(r.metrics.title).toString().trim().length > 2)

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
    { key: "date", label: "Date" },
    { key: "engagements", label: "Engagements" },
    { key: "impressions", label: "Impressions" },
    { key: "clicks", label: "Clicks" },
  ]

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Top Content</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => {
                    if (sortBy === h.key) {
                      setSortDir(sortDir === "desc" ? "asc" : "desc")
                    } else {
                      setSortBy(h.key)
                      setSortDir("desc")
                    }
                  }}
                  className="text-left py-3 px-4 font-semibold text-neutral-400 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {h.label}
                    {sortBy === h.key &&
                      (sortDir === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center py-8 text-gray-400">
                  No posts to display
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className="border-b border-border hover:bg-card-hover cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 text-foreground truncate max-w-xs">{row.metrics.title || "(No title)"}</td>
                  <td className="py-3 px-4 text-neutral-400">{row.date}</td>
                  <td className="py-3 px-4 text-neutral-400">{row.metrics.engagements ?? "-"}</td>
                  <td className="py-3 px-4 text-neutral-400">{row.metrics.impressions ?? "-"}</td>
                  <td className="py-3 px-4 text-neutral-400">{row.metrics.clicks ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-end mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                page === i + 1 ? "bg-primary text-white" : "bg-neutral-900 text-neutral-400 hover:text-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
