"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  CONTENT_STATUSES,
  CONTENT_PLATFORMS,
  STATUS_CONFIG,
  PLATFORM_CONFIG,
  type ContentStatus,
  type ContentPlatform,
} from "@/lib/content/types"

interface ContentFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  status: ContentStatus | ""
  onStatusChange: (v: ContentStatus | "") => void
  platform: ContentPlatform | ""
  onPlatformChange: (v: ContentPlatform | "") => void
}

export function ContentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  platform,
  onPlatformChange,
}: ContentFiltersProps) {
  const hasFilters = search || status || platform

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative w-56">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Status filter */}
      <Select value={status || "all"} onValueChange={(v) => onStatusChange(v === "all" ? "" : v as ContentStatus)}>
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {CONTENT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                {STATUS_CONFIG[s].label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Platform filter */}
      <Select value={platform || "all"} onValueChange={(v) => onPlatformChange(v === "all" ? "" : v as ContentPlatform)}>
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue placeholder="All platforms" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All platforms</SelectItem>
          {CONTENT_PLATFORMS.map((p) => (
            <SelectItem key={p} value={p}>{PLATFORM_CONFIG[p].label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => {
            onSearchChange("")
            onStatusChange("")
            onPlatformChange("")
          }}
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
