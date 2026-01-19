
/**
 * File: calendar-heatmap.tsx
 * Path: /components/dashboard/calendar-heatmap.tsx
 * Last Modified: 2025-12-22
 * Description: Calendar heatmap con drilldown mejorado que pasa posts reales del día seleccionado
 */

"use client"

import { useState } from "react"
import type { ParsedDataset, DataPoint } from "@/lib/parsers/types"

interface CalendarHeatmapProps {
  data: ParsedDataset
  platform: string
  dateRange: string
  onDateClick?: (dateStr: string, posts: DataPoint[]) => void
}

function normalizePlatform(platform: string): string {
  const normalized = platform.toLowerCase()
  if (normalized === 'x') return 'twitter'
  return normalized
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  return `${months[month]} ${year}`
}

export function CalendarHeatmap({ data, platform, dateRange, onDateClick }: CalendarHeatmapProps) {
  const [metric, setMetric] = useState("engagements")
  const [monthIdx, setMonthIdx] = useState(0)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

  // Filtrar por plataforma si es necesario
  let filteredData = data.dataPoints
  if (platform !== "All") {
    const normalizedFilter = normalizePlatform(platform)
    filteredData = filteredData.filter(p => p.source.toLowerCase() === normalizedFilter)
  }

  const allDates = filteredData.map((r) => new Date(r.date)).filter((date) => !isNaN(date.getTime()))

  if (!allDates.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Calendar Heatmap</h3>
        <div className="text-foreground text-center py-8">
          No data to display
          {platform !== "All" && ` for ${platform}`}
        </div>
      </div>
    )
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
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Calendar Heatmap</h3>
        <div className="text-foreground text-center py-8">No calendar data available</div>
      </div>
    )
  }

  const days = getMonthGrid(currentMonthData.year, currentMonthData.month)

  // Agregar datos por fecha Y guardar posts originales
  const values: Record<string, Record<string, number>> = {}
  const postsByDate: Record<string, DataPoint[]> = {}
  
  filteredData.forEach((dataPoint) => {
    if (!dataPoint.date) return
    const dateStr = dataPoint.date
    
    // Guardar el post completo
    if (!postsByDate[dateStr]) postsByDate[dateStr] = []
    postsByDate[dateStr].push(dataPoint)
    
    // Agregar métricas para el heatmap
    if (!values[dateStr]) values[dateStr] = {}
    Object.keys(dataPoint.metrics).forEach((key) => {
      const value = Number(dataPoint.metrics[key])
      if (!isNaN(value)) {
        values[dateStr][key] = (values[dateStr][key] || 0) + value
      }
    })
  })

  const maxValue = Math.max(
    ...Object.values(values)
      .map((v) => v[metric] || 0)
      .filter((v) => v > 0),
    1
  )

  const handleDateClick = (dateStr: string) => {
    const postsForDate = postsByDate[dateStr]
    if (postsForDate && postsForDate.length > 0 && onDateClick) {
      // Pasar todos los posts de ese día
      onDateClick(dateStr, postsForDate)
    }
  }

  // Detectar métricas disponibles
  const availableMetrics = new Set<string>()
  Object.values(values).forEach(dayMetrics => {
    Object.keys(dayMetrics).forEach(key => {
      if (typeof dayMetrics[key] === 'number' && dayMetrics[key] > 0) {
        availableMetrics.add(key)
      }
    })
  })

  const metricOptions = [
    { value: 'engagements', label: 'Engagements' },
    { value: 'impressions', label: 'Impressions' },
    { value: 'clicks', label: 'Clicks' },
    { value: 'reactions', label: 'Reactions' },
    { value: 'comments', label: 'Comments' },
    { value: 'new_followers', label: 'New Followers' },
    { value: 'page_views', label: 'Page Views' },
  ].filter(opt => availableMetrics.has(opt.value))

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Calendar Heatmap</h3>

      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Metric:</label>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {metricOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          disabled={monthIdx <= 0}
          onClick={() => setMonthIdx((m) => m - 1)}
          className="px-3 py-2 rounded-lg hover:bg-accent disabled:opacity-50 text-neutral-600 dark:text-neutral-300"
        >
          &lt;
        </button>
        <div className="text-sm font-bold text-foreground">
          {formatMonthYear(currentMonthData.year, currentMonthData.month)}
        </div>
        <button
          disabled={monthIdx >= months.length - 1}
          onClick={() => setMonthIdx((m) => m + 1)}
          className="px-3 py-2 rounded-lg hover:bg-accent disabled:opacity-50 text-neutral-600 dark:text-neutral-300"
        >
          &gt;
        </button>
        
        {platform !== "All" && (
          <span className="text-xs text-neutral-500 ml-auto">
            Showing {platform} only
          </span>
        )}
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
            const dayPosts = postsByDate[dayStr] || []
            const value = dayMetrics[metric] || 0
            const hasData = value > 0 && dayPosts.length > 0
            const isCurrentMonth = dateObj.getMonth() === currentMonthData.month

            return (
              <div
                key={idx}
                className={`rounded-lg h-12 flex items-center justify-center text-xs font-medium relative group ${
                  hasData ? "cursor-pointer" : ""
                } ${!isCurrentMonth ? "opacity-40" : ""}`}
                style={{
                  background: hasData 
                    ? `rgba(42, 95, 74, ${Math.min(value / maxValue, 1)})` 
                    : "rgba(100,100,100,0.1)",
                  color: hasData ? "#fff" : "#888",
                }}
                onMouseEnter={() => hasData && setHoveredDate(dayStr)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => hasData && handleDateClick(dayStr)}
              >
                {dateObj.getDate()}

                {hoveredDate === dayStr && hasData && (
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg p-3 whitespace-nowrap z-50 shadow-lg pointer-events-none border border-slate-700">
                    <div className="font-semibold mb-1">{dayStr}</div>
                    <div className="text-neutral-300 mb-1">{dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}</div>
                    {Object.entries(dayMetrics)
                      .filter(([_, val]) => typeof val === 'number' && val > 0)
                      .slice(0, 5)
                      .map(([key, val]) => (
                        <div key={key}>
                          {key.replace(/_/g, ' ')}: {Number(val).toLocaleString()}
                        </div>
                      ))
                    }
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