/**
 * File: report-slide.tsx
 * Path: /components/dashboard/weekly-summary/report-slide.tsx
 * Last Modified: 2026-02-02
 * Description: Slide del reporte visual
 */

"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, Sparkles, AlertCircle, Lightbulb } from "lucide-react"
import type { WeeklySummary } from "@/lib/analytics/weekly-summary-calculator"

interface ReportSlideProps {
  summary: WeeklySummary
}

export function ReportSlide({ summary }: ReportSlideProps) {
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp className="w-5 h-5" />
    if (trend === "down") return <TrendingDown className="w-5 h-5" />
    return <Minus className="w-5 h-5" />
  }

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return "text-green-600 bg-green-100"
    if (trend === "down") return "text-red-600 bg-red-100"
    return "text-gray-600 bg-gray-100"
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-8 min-h-[600px] max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Weekly Summary
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {summary.weekRange.start} - {summary.weekRange.end}
        </p>
      </motion.div>

      {/* Engagement Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${getTrendColor(summary.engagement.trend)}`}>
            {getTrendIcon(summary.engagement.trend)}
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Engagement</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {summary.engagement.total.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {summary.engagement.change > 0 ? "+" : ""}
          {summary.engagement.change.toFixed(1)}% from last week
        </div>
      </motion.div>

      {/* Top Performer */}
      {summary.topPerformer && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-600">Top Performer</span>
          </div>
          <p className="text-gray-900 dark:text-white font-medium mb-2">
            "{summary.topPerformer.title}"
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            +{summary.topPerformer.boost.toFixed(0)}% above your average
          </p>
        </motion.div>
      )}

      {/* Underperformer */}
      {summary.underperformer && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-orange-600">Needs Attention</span>
          </div>
          <p className="text-gray-900 dark:text-white font-medium mb-2">
            "{summary.underperformer.title}"
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            -{summary.underperformer.drop.toFixed(0)}% below your average
          </p>
        </motion.div>
      )}

      {/* Insights */}
      {summary.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-purple-600">Key Insights</span>
          </div>
          <ul className="space-y-2">
            {summary.insights.map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="text-purple-500 mt-0.5">•</span>
                <span>{insight}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}