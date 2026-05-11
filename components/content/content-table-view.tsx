"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, Trash2, ChevronUp, ChevronDown, Pencil } from "lucide-react"
import { ContentStatusBadge } from "./content-status-badge"
import { ContentPlatformBadges } from "./content-platform-badges"
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/components/ui/select"
import { CONTENT_STATUSES, STATUS_CONFIG, type ContentStatus } from "@/lib/content/types"
import type { ContentItem } from "@/lib/content/types"

type SortKey = "title" | "status" | "updated_at" | "due_date"
type SortDir = "asc" | "desc"

interface ContentTableViewProps {
  items: ContentItem[]
  onStatusChange: (id: string, status: ContentStatus) => void
  onDelete: (id: string) => void
  onEdit: (item: ContentItem) => void
}

function fmt(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

export function ContentTableView({ items, onStatusChange, onDelete, onEdit }: ContentTableViewProps) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>("updated_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const sorted = [...items].sort((a, b) => {
    const av = a[sortKey] ?? ""
    const bv = b[sortKey] ?? ""
    const cmp = String(av).localeCompare(String(bv))
    return sortDir === "asc" ? cmp : -cmp
  })

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-neutral-500">No content items match your filters.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-neutral-50/50 dark:bg-neutral-900/50">
              {(
                [
                  { key: "title" as SortKey, label: "Title" },
                  { key: "status" as SortKey, label: "Status" },
                ] as { key: SortKey; label: string }[]
              ).map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => toggleSort(key)}
                >
                  <span className="flex items-center gap-1">
                    {label} <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 whitespace-nowrap">Platforms</th>
              <th
                className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 cursor-pointer select-none whitespace-nowrap"
                onClick={() => toggleSort("due_date")}
              >
                <span className="flex items-center gap-1">Due <SortIcon col="due_date" /></span>
              </th>
              <th
                className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 cursor-pointer select-none whitespace-nowrap"
                onClick={() => toggleSort("updated_at")}
              >
                <span className="flex items-center gap-1">Updated <SortIcon col="updated_at" /></span>
              </th>
              <th className="px-4 py-2.5 w-20" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 cursor-pointer group"
                onClick={() => router.push(`/content/${item.id}`)}
              >
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-medium text-foreground truncate">{item.title}</p>
                  {item.campaign && (
                    <p className="text-xs text-neutral-400 truncate">{item.campaign}</p>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={item.status}
                    onValueChange={(v) => onStatusChange(item.id, v as ContentStatus)}
                  >
                    <SelectTrigger className="h-auto border-none bg-transparent p-0 shadow-none focus:ring-0 w-auto">
                      <ContentStatusBadge status={item.status} size="sm" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className="flex items-center gap-2 text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                            {STATUS_CONFIG[s].label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <ContentPlatformBadges platforms={item.platforms} max={2} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`text-xs ${
                      item.due_date &&
                      new Date(item.due_date) < new Date() &&
                      !["published", "archived"].includes(item.status)
                        ? "text-red-500"
                        : "text-neutral-500"
                    }`}
                  >
                    {fmt(item.due_date)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                  {fmt(item.updated_at)}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1 rounded hover:bg-accent transition-colors"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5 text-neutral-400 hover:text-foreground" />
                    </button>
                    {item.external_url && (
                      <a
                        href={item.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-accent"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                      </a>
                    )}
                    <button
                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
