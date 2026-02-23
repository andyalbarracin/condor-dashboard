/**
 * File: growth-slide.tsx
 * Path: /components/dashboard/weekly-summary/growth-slide.tsx
 * Last Modified: 2026-02-02
 * Description: Slide 4 - Growth comparison CON NAVEGACIÓN
 */

"use client"

import { motion } from "framer-motion"
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react"
import type { WeeklySummary } from "@/lib/analytics/weekly-summary-calculator"

interface GrowthSlideProps {
  summary: WeeklySummary
}

export function GrowthSlide({ summary }: GrowthSlideProps) {
  const isGrowing = summary.engagement.change > 0
  const changeAbs = Math.abs(summary.engagement.change)

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-12 min-h-[600px] max-h-[90vh] overflow-y-auto flex flex-col text-white">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-2">
          Growth Analysis
        </p>
        <h2
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          How You're Trending
        </h2>
      </motion.div>

      {/* Main comparison */}
      <div className="flex-1 flex flex-col justify-center mb-6">
        
        {/* Week vs Week */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 mb-6"
        >
          <p className="text-lg mb-4 text-blue-200">This week vs last week</p>
          
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                isGrowing ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isGrowing ? (
                <ArrowUp className="w-10 h-10" />
              ) : (
                <ArrowDown className="w-10 h-10" />
              )}
            </motion.div>

            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-7xl font-bold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {isGrowing ? "+" : "-"}{changeAbs.toFixed(1)}%
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-blue-200 mt-2"
              >
                {isGrowing ? "Growth" : "Decline"} in engagement
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Insight box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold mb-2 text-lg">Quick Analysis</p>
              <p className="text-blue-100">
                {isGrowing
                  ? `You're on the right track! Your content resonated ${changeAbs.toFixed(0)}% better this week.`
                  : changeAbs < 10
                  ? `A slight dip this week, but nothing to worry about. Keep experimenting!`
                  : `Time to revisit your strategy. Check what worked in previous weeks.`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation hint */}
      <div className="text-sm text-blue-300 text-center opacity-70">
        Use arrow keys to navigate
      </div>
    </div>
  )
}