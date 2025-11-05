"use client"

import { useState } from "react"
import type { ParsedDataset } from "@/lib/parsers/types"

interface CalendarHeatmapProps {
  data: ParsedDataset
  platform: string
  dateRange: string
  onDateClick?: (dateStr: string, metrics: Record<string, number>) => void
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

  const days = []
  const current = new Date(startDate)

  while (current <= endDate) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatMonthYear(year: number, month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return `${months[month]} ${year}`
}

export function CalendarHeatmap({ data, platform, dateRange, onDateClick }: CalendarHeatmapProps) {
  const [metric, setMetric] = useState("engagements")
  const [monthIdx, setMonthIdx] = useState(0)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"]

  const allDates = data.dataPoints.map((r) => new Date(r.date)).filter((date) => !isNaN(date.getTime()))

  if (!allDates.length) {
    return <div className="text-foreground dark:text-foreground text-center py-8">No data to display in calendar</div>
  }

  const minDate = allDates.reduce((a, b) => (a < b ? a : b))
  const maxDate = allDates.reduce((a, b) => (a > b ? a : b))

  const months = []
  const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1)

  while (current < end) {
    months.push({ year: current.getFullYear(), month: current.getMonth() })
    current.setMonth(current.getMonth() + 1)
  }

  const currentMonthData = months[monthIdx] || months[0]
  if (!currentMonthData) {
    return <div className="text-foreground dark:text-foreground text-center py-8">No calendar data available</div>
  }

  const days = getMonthGrid(currentMonthData.year, currentMonthData.month)

  const values: Record<string, Record<string, number>> = {}
  data.dataPoints.forEach((r) => {
    if (!r.date) return
    const dateStr = r.date
    if (!values[dateStr]) values[dateStr] = {}
    Object.keys(r.metrics).forEach((key) => {
      values[dateStr][key] = (values[dateStr][key] || 0) + (Number(r.metrics[key]) || 0)
    })
  })

  const maxValue = Math.max(
    ...Object.values(values)
      .map((v) => v[metric] || 0)
      .filter((v) => v > 0),
    1,
  )

  const handleDateClick = (dateStr: string, dayMetrics: Record<string, number>) => {
    if (dayMetrics[metric] > 0 && onDateClick) {
      onDateClick(dateStr, dayMetrics)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground dark:text-foreground mb-4">Calendar Heatmap</h3>

      <div className="mb-4 flex gap-4 items-center">
        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Metric:</label>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground dark:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="engagements">Engagements</option>
          <option value="impressions">Impressions</option>
          <option value="clicks">Clicks</option>
        </select>

        <button
          disabled={monthIdx <= 0}
          onClick={() => setMonthIdx((m) => m - 1)}
          className="px-3 py-2 rounded-lg hover:bg-accent disabled:opacity-50 text-neutral-600 dark:text-neutral-300"
        >
          &lt;
        </button>
        <div className="text-sm font-bold text-foreground dark:text-foreground">
          {formatMonthYear(currentMonthData.year, currentMonthData.month)}
        </div>
        <button
          disabled={monthIdx >= months.length - 1}
          onClick={() => setMonthIdx((m) => m + 1)}
          className="px-3 py-2 rounded-lg hover:bg-accent disabled:opacity-50 text-neutral-600 dark:text-neutral-300"
        >
          &gt;
        </button>
      </div>

      <div className="overflow-x-auto relative">
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
          {daysOfWeek.map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-2">
              {d}
            </div>
          ))}
          {days.map((dateObj, idx) => {
            const dayStr = formatDate(dateObj)
            const dayMetrics = values[dayStr] || {}
            const value = dayMetrics[metric] || 0
            const hasData = value > 0
            const isCurrentMonth = dateObj.getMonth() === currentMonthData.month

            return (
              <div
                key={idx}
                className={`rounded-lg h-12 flex items-center justify-center text-sm font-medium relative group ${
                  hasData ? "cursor-pointer" : ""
                } ${!isCurrentMonth ? "opacity-40" : ""}`}
                style={{
                  background: hasData ? `rgba(42, 95, 74, ${Math.min(value / maxValue, 1)})` : "rgba(0,0,0,0.1)",
                  color: "#fff",
                }}
                onMouseEnter={() => hasData && setHoveredDate(dayStr)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => handleDateClick(dayStr, dayMetrics)}
              >
                {dateObj.getDate()}
                {hasData && <span className="ml-1">📊</span>}

                {hoveredDate === dayStr && hasData && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg p-2 whitespace-nowrap z-50 shadow-lg pointer-events-none border border-slate-700">
                    <div className="font-semibold">{dayStr}</div>
                    <div>Engagements: {(dayMetrics.engagements || 0).toLocaleString()}</div>
                    <div>Impressions: {(dayMetrics.impressions || 0).toLocaleString()}</div>
                    <div>Clicks: {(dayMetrics.clicks || 0).toLocaleString()}</div>
                    <div className="text-xs opacity-70 mt-1">Click to view details</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
