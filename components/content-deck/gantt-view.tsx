"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { BOARD_PLATFORM_CONFIG, BOARD_STATUS_CONFIG } from "@/lib/content-deck/status-colors"
import type { ContentGroup, BoardItem } from "@/lib/content-deck/types"

interface GanttViewProps {
  groups: ContentGroup[]
  items: BoardItem[]
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

const WEEKS_VISIBLE = 8

function calcInitialOffset(items: BoardItem[]): number {
  const datedItems = items.filter(i => i.due_date || i.start_date)
  if (datedItems.length === 0) return 0
  const dates = datedItems
    .map(i => i.start_date ?? i.due_date)
    .filter((d): d is string => Boolean(d))
    .sort()
  if (dates.length === 0) return 0
  const earliest = new Date(dates[0] + "T00:00:00")
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  // Position the view so earliest date is ~1 week into the visible window
  return Math.floor(daysBetween(now, earliest) / 7) - 1
}

export function GanttView({ groups, items }: GanttViewProps) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const [offsetWeeks, setOffsetWeeks] = useState(() => calcInitialOffset(items))

  const viewStart = addDays(now, offsetWeeks * 7)
  const viewEnd = addDays(viewStart, WEEKS_VISIBLE * 7)
  const totalDays = WEEKS_VISIBLE * 7

  const weeks: Date[] = []
  for (let i = 0; i < WEEKS_VISIBLE; i++) {
    weeks.push(addDays(viewStart, i * 7))
  }

  const todayOffset = daysBetween(viewStart, now)
  const showTodayLine = todayOffset >= 0 && todayOffset <= totalDays

  function barStyle(item: BoardItem): React.CSSProperties | null {
    const startRaw = item.start_date ?? item.due_date
    const endRaw   = item.due_date ?? item.start_date
    if (!startRaw) return null

    const start = new Date(startRaw + "T00:00:00")
    const end   = endRaw ? new Date(endRaw + "T00:00:00") : addDays(start, 1)
    // Give single-day items a minimum 1-day width
    const effectiveEnd = daysBetween(start, end) === 0 ? addDays(start, 1) : end

    const s = daysBetween(viewStart, start)
    const e = daysBetween(viewStart, effectiveEnd)
    const clampedS = Math.max(0, s)
    const clampedE = Math.min(totalDays, e)
    if (clampedE <= clampedS) return null

    return {
      left: `${(clampedS / totalDays) * 100}%`,
      width: `${Math.max((clampedE - clampedS) / totalDays * 100, 0.8)}%`,
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button onClick={() => setOffsetWeeks(o => o - 1)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 min-w-[200px] text-center">
          {viewStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
          {viewEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <button onClick={() => setOffsetWeeks(o => o + 1)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setOffsetWeeks(calcInitialOffset(items))}
          className="text-xs text-neutral-500 hover:text-foreground px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
        >
          Jump to data
        </button>
        <button
          onClick={() => setOffsetWeeks(0)}
          className="text-xs text-neutral-500 hover:text-foreground px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
        >
          Today
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden w-full">
        {/* Column headers */}
        <div className="flex border-b border-border bg-neutral-50/50 dark:bg-neutral-900/30">
          <div className="w-[260px] flex-shrink-0 px-3 py-2 text-xs font-medium text-neutral-400 border-r border-border">
            Task
          </div>
          <div className="flex-1 flex">
            {weeks.map((week, i) => (
              <div key={i} className="border-r border-border last:border-r-0 px-2 py-2 text-xs text-neutral-400" style={{ flex: 1 }}>
                {week.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            ))}
          </div>
        </div>

        {groups.map(group => {
          const groupItems = items.filter(i => i.group_id === group.id)
          if (groupItems.length === 0) return null

          return (
            <div key={group.id}>
              {/* Group row */}
              <div className="flex items-center border-b border-border bg-neutral-50/30 dark:bg-neutral-800/20">
                <div className="w-[260px] flex-shrink-0 px-3 py-1.5 text-xs font-bold border-r border-border" style={{ color: group.color }}>
                  {group.name}
                </div>
                <div className="flex-1 h-8 relative">
                  {weeks.map((_, i) => (
                    <div key={i} className="absolute top-0 bottom-0 border-r border-border/30" style={{ left: `${(i / WEEKS_VISIBLE) * 100}%`, width: `${(1 / WEEKS_VISIBLE) * 100}%` }} />
                  ))}
                </div>
              </div>

              {groupItems.map(item => {
                const bar = barStyle(item)
                const platformCfg = item.platform ? BOARD_PLATFORM_CONFIG[item.platform] : null
                const statusCfg = BOARD_STATUS_CONFIG[item.status]

                return (
                  <div key={item.id} className="flex items-center border-b border-border last:border-0 hover:bg-neutral-50/40 dark:hover:bg-neutral-900/20">
                    <div className="w-[260px] flex-shrink-0 px-3 py-2 flex items-center gap-2 border-r border-border">
                      <div className="w-0.5 h-4 flex-shrink-0 rounded" style={{ backgroundColor: group.color }} />
                      <span className="text-xs truncate text-foreground" title={item.title}>{item.title}</span>
                    </div>

                    <div className="flex-1 relative h-8 overflow-hidden">
                      {/* Week grid lines */}
                      {weeks.map((_, i) => (
                        <div key={i} className="absolute top-0 bottom-0 border-r border-border/30" style={{ left: `${(i / WEEKS_VISIBLE) * 100}%`, width: `${(1 / WEEKS_VISIBLE) * 100}%` }} />
                      ))}

                      {/* Today line */}
                      {showTodayLine && (
                        <div
                          className="absolute top-0 bottom-0 w-px bg-red-400/70 z-10"
                          style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                        />
                      )}

                      {/* Bar */}
                      {bar ? (
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-5 rounded text-[9px] font-medium text-white flex items-center px-1.5 truncate z-20",
                            platformCfg?.bg ?? statusCfg.bg
                          )}
                          style={bar}
                          title={`${item.title}${item.due_date ? ` · ${item.due_date}` : ""}`}
                        >
                          {item.title}
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] text-neutral-300 italic">no date</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {items.filter(i => i.due_date || i.start_date).length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-neutral-400">No items have dates.</p>
            <p className="text-xs text-neutral-300 mt-1">Add due dates to items to see them on the timeline.</p>
          </div>
        )}
      </div>
    </div>
  )
}
