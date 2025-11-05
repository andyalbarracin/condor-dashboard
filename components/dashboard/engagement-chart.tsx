"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"
import type { ParsedDataset } from "@/lib/parsers/types"

interface EngagementChartProps {
  data: ParsedDataset
  metric?: string
}

export function EngagementChart({ data, metric = "impressions" }: EngagementChartProps) {
  // Prepare data for chart - filter to key metrics
  const chartData = data.dataPoints.map((point) => ({
    date: point.date,
    ...Object.entries(point.metrics)
      .filter(([key]) => key.includes(metric) || key === "date")
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
  }))

  const metricKeys = Object.keys(chartData[0] || {}).filter((k) => k !== "date")

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Engagement Trend</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--neutral-500))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--neutral-500))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value) => [typeof value === "number" ? value.toLocaleString() : value]}
            />
            <Legend />
            {metricKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function EngagementBarChart({ data, metric = "impressions" }: EngagementChartProps) {
  // Sample every 7 days for cleaner bar chart
  const sampledData = data.dataPoints
    .filter((_, idx) => idx % 7 === 0)
    .map((point) => ({
      date: point.date,
      ...Object.entries(point.metrics)
        .filter(([key]) => key.includes(metric) || key === "date")
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
    }))

  const metricKeys = Object.keys(sampledData[0] || {}).filter((k) => k !== "date")

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">{metric.replace(/_/g, " ").toUpperCase()} Distribution</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sampledData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--neutral-500))" style={{ fontSize: "12px" }} />
            <YAxis stroke="hsl(var(--neutral-500))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value) => [typeof value === "number" ? value.toLocaleString() : value]}
            />
            <Legend />
            {metricKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} fill={`hsl(${(idx * 60) % 360}, 70%, 50%)`} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
