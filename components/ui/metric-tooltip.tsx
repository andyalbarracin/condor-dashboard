/**
 * File: metric-tooltip.tsx
 * Path: /components/ui/metric-tooltip.tsx
 * Last Modified: 2026-02-02
 * Description: Componente reutilizable de tooltip para métricas
 */

"use client"

import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { MetricTooltip } from "@/lib/constants/metric-tooltips"

interface MetricTooltipProps {
  metric: MetricTooltip
  size?: "sm" | "md" | "lg"
}

export function MetricTooltipIcon({ metric, size = "sm" }: MetricTooltipProps) {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-4 h-4" : "w-5 h-5"
  
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center">
            <HelpCircle className={`${iconSize} text-muted-foreground hover:text-foreground transition-colors cursor-help`} />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs p-4 bg-popover border border-border shadow-lg"
          side="top"
        >
          <div className="space-y-2">
            <p className="font-bold text-sm text-foreground">{metric.title}</p>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {metric.description}
            </p>
            
            {metric.calculation && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-foreground mb-1">How it's calculated:</p>
                <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                  {metric.calculation}
                </p>
              </div>
            )}
            
            {metric.goodRange && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-foreground mb-1">Good range:</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {metric.goodRange}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}