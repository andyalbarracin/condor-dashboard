"use client"

import type { ParsedDataset } from "@/lib/parsers/types"
import { ArrowUp, ArrowDown } from "lucide-react"

interface MetricsSummaryProps {
  data: ParsedDataset
}

export function MetricsSummary({ data }: MetricsSummaryProps) {
  const calculateMetric = (key: string) => {
    const values = data.dataPoints.map((dp) => dp.metrics[key]).filter((v): v is number => typeof v === "number")

    return {
      total: values.reduce((a, b) => a + b, 0),
      average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      max: values.length > 0 ? Math.max(...values) : 0,
    }
  }

  // Get available metric keys
  const allMetricKeys = Object.keys(data.dataPoints[0]?.metrics || {})
  const importantMetrics = allMetricKeys.filter((k) => !k.includes("rate") && !k.includes("sponsored")).slice(0, 4)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {importantMetrics.map((metric) => {
        const stats = calculateMetric(metric)
        const change = Math.random() * 40 - 20 // Placeholder

        return (
          <div key={metric} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-neutral-500 uppercase tracking-wide">{metric.replace(/_/g, " ")}</p>
              {change > 0 ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 mt-2">
              Avg: {stats.average.toLocaleString(undefined, { maximumFractionDigits: 0 })} • Max:{" "}
              {stats.max.toLocaleString()}
            </p>
          </div>
        )
      })}
    </div>
  )
}
