"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { BOARD_PLATFORM_CONFIG, BOARD_STATUS_CONFIG } from "@/lib/content-deck/status-colors"
import type { BoardItem } from "@/lib/content-deck/types"

interface CalendarViewProps {
  items: BoardItem[]
  onOpenUpdates: (item: BoardItem) => void
  onOpenDetail?: (item: BoardItem) => void
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]

function calcInitialMonth(items: BoardItem[]): { year: number; month: number } {
  const dated = items.filter(i => i.due_date)
  if (dated.length === 0) {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  }
  const earliest = dated.map(i => i.due_date!).sort()[0]
  const d = new Date(earliest + "T12:00:00")
  return { year: d.getFullYear(), month: d.getMonth() }
}

export function CalendarView({ items, onOpenUpdates, onOpenDetail }: CalendarViewProps) {
  const initial = useMemo(() => calcInitialMonth(items), [])
  const [year, setYear] = useState(initial.year)
  const [month, setMonth] = useState(initial.month)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const jumpToToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()) }
  const jumpToData = () => {
    const { year: y, month: m } = calcInitialMonth(items)
    setYear(y); setMonth(m)
  }

  const itemsByDate = useMemo(() => {
    const map: Record<string, BoardItem[]> = {}
    for (const item of items) {
      if (!item.due_date) continue
      const key = item.due_date.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(item)
    }
    return map
  }, [items])

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const handleItemClick = (item: BoardItem) => {
    if (onOpenDetail) onOpenDetail(item)
    else onOpenUpdates(item)
  }

  const hasDatedItems = items.some(i => i.due_date)

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-base font-semibold min-w-[160px] text-center">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={jumpToToday}
          className="text-xs text-neutral-500 hover:text-foreground px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
        >
          Today
        </button>
        {hasDatedItems && (
          <button
            onClick={jumpToData}
            className="text-xs text-neutral-500 hover:text-foreground px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
          >
            Jump to data
          </button>
        )}
      </div>

      {!hasDatedItems && (
        <div className="text-center py-10 text-sm text-neutral-400">
          No items have due dates. Add dates to items to see them on the calendar.
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden w-full">
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-neutral-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[90px] border-b border-r border-border bg-neutral-50/30 dark:bg-neutral-900/20 last:border-r-0"
                  style={{ borderRight: (idx + 1) % 7 === 0 ? "none" : undefined }}
                />
              )
            }

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const dayItems = itemsByDate[dateKey] ?? []
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

            return (
              <div
                key={dateKey}
                className={cn(
                  "min-h-[90px] p-1.5 border-b border-border",
                  (idx + 1) % 7 !== 0 && "border-r",
                  isToday && "bg-blue-50/40 dark:bg-blue-950/20"
                )}
              >
                <div className={cn(
                  "w-6 h-6 flex items-center justify-center text-xs mb-1 rounded-full select-none",
                  isToday
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-neutral-500"
                )}>
                  {day}
                </div>

                <div className="space-y-0.5">
                  {dayItems.slice(0, 3).map(item => {
                    const platformCfg = item.platform ? BOARD_PLATFORM_CONFIG[item.platform] : null
                    const statusCfg = BOARD_STATUS_CONFIG[item.status]
                    const bgClass = platformCfg?.bg ?? statusCfg.bg

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate text-white hover:opacity-90 transition-opacity",
                          bgClass
                        )}
                        title={item.title}
                      >
                        {item.title}
                      </button>
                    )
                  })}
                  {dayItems.length > 3 && (
                    <p className="text-[10px] text-neutral-400 pl-1">+{dayItems.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
