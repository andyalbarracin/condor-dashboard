/**
 * File: kpi-card.tsx
 * Path: /components/dashboard/kpi-card.tsx
 * Last Modified: 2025-12-06
 * Description: Card de KPI con datos normalizados y cálculos automáticos
 */

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  label: string
  value: string | number
  change?: number
  subText?: string
  icon?: React.ReactNode
  tooltipKey?: string
  trend?: "up" | "down" | "neutral"
}

export function KPICard({ label, value, change, subText, icon, trend }: KPICardProps) {
  // Determinar tendencia automáticamente si no se proporciona
  let finalTrend = trend
  if (!finalTrend && change !== undefined) {
    if (change > 0) finalTrend = "up"
    else if (change < 0) finalTrend = "down"
    else finalTrend = "neutral"
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
            <h3 className="text-3xl font-bold text-foreground mt-2">{value}</h3>
            {subText && <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{subText}</p>}
          </div>
          
          {icon && (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
        </div>

        {change !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            {finalTrend === "up" && (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">+{Math.abs(change).toFixed(1)}%</span>
              </>
            )}
            {finalTrend === "down" && (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-500">{change.toFixed(1)}%</span>
              </>
            )}
            {finalTrend === "neutral" && (
              <>
                <Minus className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-500">0%</span>
              </>
            )}
            <span className="text-xs text-neutral-500">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}