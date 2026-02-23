/**
 * File: overview-slide.tsx
 * Path: /components/dashboard/weekly-summary/overview-slide.tsx
 * Last Modified: 2026-02-02
 * Description: Slide 2 - Engagement overview CON NAVEGACIÓN
 */

"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react"
import type { WeeklySummary } from "@/lib/analytics/weekly-summary-calculator"

interface OverviewSlideProps {
  summary: WeeklySummary
}

export function OverviewSlide({ summary }: OverviewSlideProps) {
  const getTrendIcon = () => {
    if (summary.engagement.trend === "up") return <TrendingUp className="w-8 h-8" />
    if (summary.engagement.trend === "down") return <TrendingDown className="w-8 h-8" />
    return <Minus className="w-8 h-8" />
  }

  const getTrendColor = () => {
    if (summary.engagement.trend === "up") return "from-green-400 to-emerald-500"
    if (summary.engagement.trend === "down") return "from-red-400 to-orange-500"
    return "from-gray-400 to-gray-500"
  }

  const getTrendText = () => {
    if (summary.engagement.trend === "up") return "Great work! Your engagement is growing 🚀"
    if (summary.engagement.trend === "down") return "Let's see how we can improve 💪"
    return "Steady performance this week 📊"
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-12 min-h-[600px] max-h-[90vh] overflow-y-auto flex flex-col">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-2">
          Week Overview
        </p>
        <h2
          className="text-4xl font-bold text-gray-900 dark:text-white"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {summary.weekRange.start} — {summary.weekRange.end}
        </h2>
      </motion.div>

      {/* Giant Number Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`flex-1 rounded-3xl bg-gradient-to-br ${getTrendColor()} p-12 flex flex-col items-center justify-center text-white relative overflow-hidden mb-6`}
      >
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">📊</div>
          <div className="absolute bottom-10 left-10 text-9xl">✨</div>
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6 relative z-10"
        >
          {getTrendIcon()}
        </motion.div>

        {/* Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-8xl font-bold mb-4 relative z-10"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {summary.engagement.total.toLocaleString()}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-medium mb-2 relative z-10"
        >
          Total Engagements
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg opacity-90 relative z-10"
        >
          {summary.engagement.change > 0 ? "+" : ""}
          {summary.engagement.change.toFixed(1)}% from last week
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center relative z-10"
        >
          <p className="text-xl font-medium">{getTrendText()}</p>
        </motion.div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        {/* Use arrow keys - no custom buttons needed, arrows handle nav */}
        <div className="text-sm text-gray-400 dark:text-gray-500">
          Use arrow keys to navigate →
        </div>
      </div>
    </div>
  )
}