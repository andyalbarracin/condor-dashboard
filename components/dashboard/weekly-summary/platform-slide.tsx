/**
 * File: platform-slide.tsx
 * Path: /components/dashboard/weekly-summary/platform-slide.tsx
 * Last Modified: 2026-02-02
 * Description: Slide 5 - Platform breakdown CON NAVEGACIÓN
 */

"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { WeeklySummary } from "@/lib/analytics/weekly-summary-calculator"

interface PlatformSlideProps {
  summary: WeeklySummary
  onClose: () => void
}

export function PlatformSlide({ summary }: PlatformSlideProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 min-h-[600px] max-h-[90vh] overflow-y-auto flex flex-col">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-purple-300 text-sm font-bold uppercase tracking-widest mb-2">
          Platform Breakdown
        </p>
        <h2
          className="text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Your Channels
        </h2>
        <p className="text-slate-400 mt-2">
          {summary.weekRange.start} — {summary.weekRange.end}
        </p>
      </motion.div>

      {/* Platform Cards */}
      <div className="flex-1 space-y-4 mb-6">
        {summary.platformBreakdown.length > 0 ? (
          summary.platformBreakdown.map((platform, index) => {
            const isUp = platform.trend === "up"
            const isDown = platform.trend === "down"
            const platformLabel = platform.platform === "twitter" ? "X / Twitter" : "LinkedIn"
            const platformEmoji = platform.platform === "twitter" ? "𝕏" : "in"

            return (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.15 }}
                className={`p-6 rounded-2xl border flex items-center justify-between ${
                  isUp
                    ? "bg-green-500/10 border-green-500/30"
                    : isDown
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-sm ${
                      platform.platform === "twitter" ? "bg-black" : "bg-[#0a66c2]"
                    }`}
                  >
                    {platformEmoji}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{platformLabel}</p>
                    <p
                      className={`text-sm ${
                        isUp ? "text-green-400" : isDown ? "text-red-400" : "text-slate-400"
                      }`}
                    >
                      {platform.change > 0 ? "+" : ""}
                      {platform.change.toFixed(1)}% vs last week
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-full ${
                    isUp ? "bg-green-500/20" : isDown ? "bg-red-500/20" : "bg-white/10"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  ) : isDown ? (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  ) : (
                    <Minus className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </motion.div>
            )
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="text-6xl mb-4">📊</div>
            <p className="text-slate-400 text-lg">Upload more data to see platform comparisons</p>
          </motion.div>
        )}
      </div>

      {/* Navigation hint */}
      <div className="text-sm text-slate-400 text-center opacity-70">
        Use arrow keys to navigate
      </div>
    </div>
  )
}