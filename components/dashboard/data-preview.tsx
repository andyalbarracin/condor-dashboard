"use client"

import type { ParsedDataset } from "@/lib/parsers/types"
import { Card } from "@/components/ui/card"

interface DataPreviewProps {
  data: ParsedDataset
}

export function DataPreview({ data }: DataPreviewProps) {
  const firstFewRows = data.dataPoints.slice(0, 5)
  const metricKeys = Object.keys(firstFewRows[0]?.metrics || {}).slice(0, 5)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Data Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Source</p>
            <p className="font-semibold text-foreground capitalize mt-1">{data.source}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Type</p>
            <p className="font-semibold text-foreground capitalize mt-1">{data.subType || "general"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Records</p>
            <p className="font-semibold text-foreground mt-1">{data.dataPoints.length}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Date Range</p>
            <p className="font-semibold text-foreground text-xs mt-1">{data.dateRange.start}</p>
            <p className="font-semibold text-foreground text-xs">to {data.dateRange.end}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Sample Data</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-neutral-500 font-medium">Date</th>
                {metricKeys.map((key) => (
                  <th key={key} className="text-left py-3 px-3 text-neutral-500 font-medium text-xs">
                    {key.replace(/_/g, " ").toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {firstFewRows.map((row) => (
                <tr key={row.date} className="border-b border-border hover:bg-card-hover transition-colors">
                  <td className="py-3 px-3 text-foreground font-mono text-sm">{row.date}</td>
                  {metricKeys.map((key) => (
                    <td key={key} className="py-3 px-3 text-neutral-400">
                      {typeof row.metrics[key] === "number" ? row.metrics[key].toLocaleString() : row.metrics[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-500 mt-3">
          Showing {Math.min(5, data.dataPoints.length)} of {data.dataPoints.length} records
        </p>
      </Card>
    </div>
  )
}
