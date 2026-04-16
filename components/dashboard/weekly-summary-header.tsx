/**
 * File: weekly-summary-header.tsx
 * Path: /components/dashboard/weekly-summary-header.tsx
 * Last Modified: 2026-03-21
 * Description: Header con avatar + Weekly Summary / Web Summary button.
 *              Supports social modal, web modal, or static card.
 */

"use client"

import { useState } from "react"
import { Sparkles, Globe, TrendingUp } from "lucide-react"
import { WeeklySummaryModal } from "./weekly-summary-modal"
import { WebSummaryModal } from "./web-summary-modal"
import type { ParsedDataset } from "@/lib/parsers/types"

interface WeeklySummaryHeaderProps {
  data?: ParsedDataset | null
  webData?: ParsedDataset | null
  userName?: string
  subtitle?: string
  variant?: 'social' | 'web' | 'overview'
}

export function WeeklySummaryHeader({ 
  data, 
  webData,
  userName = "Andy",
  subtitle = "This is what's happening with your content",
  variant = 'social'
}: WeeklySummaryHeaderProps) {
  const [isSocialOpen, setIsSocialOpen] = useState(false)
  const [isWebOpen, setIsWebOpen] = useState(false)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  })()

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left: User Greeting */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {greeting}, {userName}! 👋
            </h2>
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Context-aware action card */}
        {variant === 'social' && data ? (
          <div 
            className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow group"
            onClick={() => setIsSocialOpen(true)}
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Weekly Summary</h3>
              <p className="text-white/80 text-sm">See how you performed this week</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : variant === 'web' && webData ? (
          <div 
            className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow group"
            onClick={() => setIsWebOpen(true)}
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Traffic Summary</h3>
              <p className="text-white/80 text-sm">See your website traffic breakdown</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : variant === 'overview' && data ? (
          <div 
            className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow group"
            onClick={() => setIsSocialOpen(true)}
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Weekly Summary</h3>
              <p className="text-white/80 text-sm">See how you performed this week</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Analytics Overview</h3>
              <p className="text-white/80 text-sm">Your data at a glance</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Social Summary Modal */}
      {data && (
        <WeeklySummaryModal
          isOpen={isSocialOpen}
          onClose={() => setIsSocialOpen(false)}
          data={data}
        />
      )}

      {/* Web Summary Modal */}
      {webData && (
        <WebSummaryModal
          isOpen={isWebOpen}
          onClose={() => setIsWebOpen(false)}
          data={webData}
        />
      )}
    </>
  )
}