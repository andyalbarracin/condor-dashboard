/**
 * File: benchmark-comparison.tsx
 * Path: /components/reports/benchmark-comparison.tsx
 * Last Modified: 2025-12-07
 * Description: Muestra comparaciones de KPIs vs benchmarks
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { BenchmarkComparison } from "@/lib/reports/benchmark-calculator"
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle } from "lucide-react"

interface BenchmarkComparisonProps {
  comparisons: BenchmarkComparison[]
  platform: 'LinkedIn' | 'X/Twitter'
  icon: React.ReactNode
}

export function BenchmarkComparisonCard({ comparisons, platform, icon }: BenchmarkComparisonProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500'
      case 'good': return 'text-blue-500'
      case 'average': return 'text-yellow-500'
      case 'below': return 'text-red-500'
      default: return 'text-neutral-500'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'good': return <TrendingUp className="w-5 h-5 text-blue-500" />
      case 'average': return <Minus className="w-5 h-5 text-yellow-500" />
      case 'below': return <AlertCircle className="w-5 h-5 text-red-500" />
      default: return <Minus className="w-5 h-5 text-neutral-500" />
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excellent'
      case 'good': return 'Good'
      case 'average': return 'Industry Average'
      case 'below': return 'Below Average'
      default: return 'Unknown'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <CardTitle>{platform} Performance</CardTitle>
            <CardDescription>Comparison vs industry benchmarks</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {comparisons.map((comp, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(comp.status)}
                  <h4 className="font-semibold text-sm">{comp.kpi}</h4>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  comp.status === 'excellent' ? 'bg-green-500/10 text-green-500' :
                  comp.status === 'good' ? 'bg-blue-500/10 text-blue-500' :
                  comp.status === 'average' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {getStatusLabel(comp.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-neutral-500 mb-1">Your Performance</p>
                  <p className="font-bold text-lg">{(comp.actual * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">Industry Avg</p>
                  <p className="font-semibold">{(comp.benchmark * 100).toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-1">Excellence</p>
                  <p className="font-semibold">{(comp.excellent * 100).toFixed(2)}%</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="relative h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all ${
                    comp.status === 'excellent' ? 'bg-green-500' :
                    comp.status === 'good' ? 'bg-blue-500' :
                    comp.status === 'average' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((comp.actual / comp.excellent) * 100, 100)}%` }}
                />
              </div>
              
              {comp.status === 'below' && (
                <p className="text-xs text-neutral-500 italic">
                  📈 Gap to industry average: {Math.abs(comp.gapPercentage).toFixed(1)}%
                </p>
              )}
              
              {idx < comparisons.length - 1 && <div className="border-t border-border" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}