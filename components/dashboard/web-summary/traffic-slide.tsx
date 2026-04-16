/**
 * File: traffic-slide.tsx
 * Path: /components/dashboard/web-summary/traffic-slide.tsx
 * Last Modified: 2026-03-21
 * Description: Web Summary Slide 2 - Traffic overview with medium breakdown
 */

"use client"

import { motion } from "framer-motion"
import { Globe, Target } from "lucide-react"
import type { WebSummary } from "@/lib/analytics/web-summary-calculator"

interface TrafficSlideProps {
  summary: WebSummary
}

export function TrafficSlide({ summary }: TrafficSlideProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 p-12 min-h-[600px] max-h-[90vh] overflow-y-auto flex flex-col text-white">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-bold text-cyan-300 uppercase tracking-widest mb-2">
          Traffic Overview
        </p>
        <h2
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Your Web Traffic
        </h2>
        <p className="text-blue-300 mt-1 text-sm">
          {summary.dateRange.start} to {summary.dateRange.end}
        </p>
      </motion.div>

      <div className="flex-1 space-y-6">
        {/* Giant number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center"
        >
          <p className="text-lg text-blue-200 mb-2">Total Sessions</p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-7xl font-bold"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {summary.totalSessions.toLocaleString()}
          </motion.div>
          <p className="text-blue-300 mt-2">
            across {summary.campaignCount} campaigns
          </p>
        </motion.div>

        {/* Medium breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-300" />
            <h3 className="font-bold text-lg">Traffic by Medium</h3>
          </div>
          <div className="space-y-3">
            {summary.mediumBreakdown.slice(0, 5).map((medium, idx) => (
              <motion.div 
                key={medium.medium}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.08 }}
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: medium.color }}
                    />
                    <span className="font-medium">{medium.medium}</span>
                  </div>
                  <span className="text-blue-200">
                    {medium.sessions.toLocaleString()} ({medium.pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${medium.pct}%` }}
                    transition={{ delay: 0.5 + idx * 0.08, duration: 0.6 }}
                    className="rounded-full h-2"
                    style={{ backgroundColor: medium.color }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="text-sm text-blue-300 text-center opacity-70 mt-4">
        Use arrow keys to navigate
      </div>
    </div>
  )
}