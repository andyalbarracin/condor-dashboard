/**
 * File: top-content-slide.tsx
 * Path: /components/dashboard/weekly-summary/top-content-slide.tsx
 * Last Modified: 2026-02-02
 * Description: Slide 3 - Top & Bottom performers CON NAVEGACIÓN
 */

"use client"

import { motion } from "framer-motion"
import { Sparkles, AlertTriangle } from "lucide-react"
import type { WeeklySummary } from "@/lib/analytics/weekly-summary-calculator"

interface TopContentSlideProps {
  summary: WeeklySummary
}

export function TopContentSlide({ summary }: TopContentSlideProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-12 min-h-[600px] max-h-[90vh] overflow-y-auto flex flex-col">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">
          Content Performance
        </p>
        <h2
          className="text-4xl font-bold text-gray-900 dark:text-white"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Your Best & Worst
        </h2>
      </motion.div>

      <div className="flex-1 space-y-6 mb-6">
        {/* Top Performer */}
        {summary.topPerformer ? (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-10">🏆</div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold mb-2">TOP PERFORMER 🔥</p>
                <p className="text-2xl font-bold mb-3 line-clamp-2">
                  "{summary.topPerformer.title}"
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold">
                    {summary.topPerformer.value.toLocaleString()}
                  </span>
                  <span className="text-lg">engagements</span>
                </div>
                <p className="mt-3 text-white/90 text-lg">
                  +{summary.topPerformer.boost.toFixed(0)}% above your average
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 text-center"
          >
            <p className="text-gray-500">No top performer this week</p>
          </motion.div>
        )}

        {/* Underperformer */}
        {summary.underperformer ? (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-10">💡</div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold mb-2">NEEDS ATTENTION</p>
                <p className="text-2xl font-bold mb-3 line-clamp-2">
                  "{summary.underperformer.title}"
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold">
                    {summary.underperformer.value.toLocaleString()}
                  </span>
                  <span className="text-lg">engagements</span>
                </div>
                <p className="mt-3 text-white/90 text-lg">
                  -{summary.underperformer.drop.toFixed(0)}% below your average
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 text-center"
          >
            <p className="text-gray-500">All posts performed well! 🎉</p>
          </motion.div>
        )}
      </div>

      {/* Navigation hint */}
      <div className="text-sm text-gray-500 text-center">
        Use arrow keys to navigate
      </div>
    </div>
  )
}