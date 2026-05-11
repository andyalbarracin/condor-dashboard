"use client"

import { useRouter } from "next/navigation"
import { ContentStatusBadge } from "./content-status-badge"
import type { ContentItem } from "@/lib/content/types"

interface ContentCalendarViewProps {
  items: ContentItem[]
}

function getDateKey(item: ContentItem): string | null {
  return item.scheduled_at
    ? item.scheduled_at.slice(0, 10)
    : item.due_date
    ? item.due_date
    : item.published_at
    ? item.published_at.slice(0, 10)
    : null
}

export function ContentCalendarView({ items }: ContentCalendarViewProps) {
  const router = useRouter()

  // Group items by date
  const grouped: Record<string, ContentItem[]> = {}
  for (const item of items) {
    const key = getDateKey(item)
    if (key) {
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(item)
    }
  }

  const datedItems = items.filter((i) => getDateKey(i))
  const undatedItems = items.filter((i) => !getDateKey(i))

  const sortedDates = Object.keys(grouped).sort()

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-neutral-500">No content items to show in calendar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {datedItems.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-neutral-500">
            No items have a scheduled date, due date, or published date. Add dates to see them here.
          </p>
        </div>
      )}

      {sortedDates.map((dateKey) => {
        const dateItems = grouped[dateKey]
        const date = new Date(dateKey + "T00:00:00")
        const isToday = dateKey === new Date().toISOString().slice(0, 10)
        const isPast = date < new Date(new Date().toDateString())

        return (
          <div key={dateKey} className="flex gap-4">
            {/* Date label */}
            <div className="w-24 flex-shrink-0 text-right pt-1">
              <p className={`text-sm font-semibold ${isToday ? "text-primary" : isPast ? "text-neutral-400" : "text-foreground"}`}>
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="text-xs text-neutral-400">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
            </div>

            {/* Divider */}
            <div className="flex flex-col items-center mt-1.5">
              <div className={`w-2 h-2 rounded-full ${isToday ? "bg-primary" : "bg-border"}`} />
              <div className="w-px flex-1 bg-border mt-1" />
            </div>

            {/* Items */}
            <div className="flex-1 space-y-2 pb-4">
              {dateItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-lg px-3 py-2.5 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all flex items-center gap-3"
                  onClick={() => router.push(`/content/${item.id}`)}
                >
                  <ContentStatusBadge status={item.status} size="sm" />
                  <p className="text-sm font-medium flex-1 truncate">{item.title}</p>
                  {item.primary_platform && (
                    <span className="text-xs text-neutral-400 capitalize">{item.primary_platform}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Undated items */}
      {undatedItems.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
            No date scheduled ({undatedItems.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {undatedItems.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-lg px-3 py-2.5 cursor-pointer hover:border-primary/30 transition-all flex items-center gap-3"
                onClick={() => router.push(`/content/${item.id}`)}
              >
                <ContentStatusBadge status={item.status} size="sm" />
                <p className="text-sm font-medium flex-1 truncate">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
