/**
 * File: platform-breakdown-pie.tsx
 * Path: /components/dashboard/platform-breakdown-pie.tsx
 * Last Modified: 2025-12-06
 * Description: Gráfico de pie mostrando distribución de posts por plataforma
 */

"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { ParsedDataset } from "@/lib/parsers/types"

interface PlatformBreakdownPieProps {
  data: ParsedDataset
  platform: string
}

const COLORS = {
  linkedin: "#0a66c2",
  twitter: "#1da1f2",
  instagram: "#e4405f",
  tiktok: "#000000",
}

export function PlatformBreakdownPie({ data, platform }: PlatformBreakdownPieProps) {
  // Contar posts por plataforma
  const platformCounts = data.dataPoints.reduce((acc, point) => {
    const source = point.source
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Convertir a formato para recharts
  const chartData = Object.entries(platformCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: COLORS[name as keyof typeof COLORS] || "#888888",
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Platform Breakdown</h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}