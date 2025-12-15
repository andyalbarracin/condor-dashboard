/**
 * File: demographic-card.tsx
 * Path: /components/dashboard/demographic-card.tsx
 * Last Modified: 2025-12-08
 * Description: Card expandible para mostrar demographics de followers/visitors
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

interface DemographicData {
  label: string
  value: number
}

interface DemographicCardProps {
  title: string
  description: string
  data: DemographicData[]
  icon?: React.ReactNode
  valueLabel?: string
}

export function DemographicCard({ title, description, data, icon, valueLabel = "followers" }: DemographicCardProps) {
  const [expanded, setExpanded] = useState(false)
  
  if (!data || data.length === 0) return null
  
  const top3 = data.slice(0, 3)
  const remaining = data.slice(3)
  const displayData = expanded ? data : top3
  
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayData.map((item, idx) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0
            
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground truncate flex-1 mr-4">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-neutral-500">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="font-semibold text-foreground min-w-[60px] text-right">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="relative h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
          
          {remaining.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-4 py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Load more ({remaining.length} more)
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm">
          <span className="text-neutral-500">Total {valueLabel}</span>
          <span className="font-bold text-lg text-foreground">
            {total.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}