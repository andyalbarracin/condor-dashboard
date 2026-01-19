/**
 * File: followers-chart.tsx
 * Path: /components/dashboard/followers-chart.tsx
 * Last Modified: 2025-12-08
 * Description: Gráfico de evolución de followers con date picker y estadísticas
 */

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp } from "lucide-react"

interface FollowersData {
  date: string
  total_followers: number
  organic_followers: number
  sponsored_followers: number
}

interface FollowersChartProps {
  data: FollowersData[]
}

export function FollowersChart({ data }: FollowersChartProps) {
  const [dateRange, setDateRange] = useState<string>("3 months")
  
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case "1 week":
        startDate.setDate(now.getDate() - 7)
        break
      case "2 weeks":
        startDate.setDate(now.getDate() - 14)
        break
      case "1 month":
        startDate.setDate(now.getDate() - 30)
        break
      case "3 months":
        startDate.setDate(now.getDate() - 90)
        break
      case "6 months":
        startDate.setDate(now.getDate() - 180)
        break
      case "1 year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date(0)
    }
    
    return data.filter(point => {
      const pointDate = new Date(point.date)
      return pointDate >= startDate && pointDate <= now
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [data, dateRange])
  
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { total: 0, organic: 0, sponsored: 0, growth: 0 }
    
    const totalGained = filteredData.reduce((sum, d) => sum + d.total_followers, 0)
    const organicGained = filteredData.reduce((sum, d) => sum + d.organic_followers, 0)
    const sponsoredGained = filteredData.reduce((sum, d) => sum + d.sponsored_followers, 0)
    
    const firstDay = filteredData[0]?.total_followers || 0
    const lastDay = filteredData[filteredData.length - 1]?.total_followers || 0
    const growth = firstDay > 0 ? ((lastDay - firstDay) / firstDay) * 100 : 0
    
    return {
      total: totalGained,
      organic: organicGained,
      sponsored: sponsoredGained,
      growth: growth
    }
  }, [filteredData])
  
  if (!data || data.length === 0) return null
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Follower Growth</CardTitle>
              <CardDescription>New followers over time</CardDescription>
            </div>
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1 week">1 week</option>
            <option value="2 weeks">2 weeks</option>
            <option value="1 month">1 month</option>
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="1 year">1 year</option>
            <option value="all">All time</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-card-hover border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-neutral-500" />
              <span className="text-xs text-neutral-500">Total Gained</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">Organic</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.organic.toLocaleString()}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-500">Sponsored</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{stats.sponsored.toLocaleString()}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary">Growth Rate</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {stats.growth > 0 ? '+' : ''}{stats.growth.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              className="text-neutral-500"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 11 }} className="text-neutral-500" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total_followers" 
              stroke="#2a5f4a" 
              strokeWidth={2}
              name="Total"
              dot={{ fill: '#2a5f4a' }}
            />
            <Line 
              type="monotone" 
              dataKey="organic_followers" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Organic"
              dot={{ fill: '#22c55e' }}
            />
            <Line 
              type="monotone" 
              dataKey="sponsored_followers" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Sponsored"
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}