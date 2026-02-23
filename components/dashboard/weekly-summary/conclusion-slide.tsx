/**
 * File: conclusion-slide.tsx
 * Path: /components/dashboard/weekly-summary/conclusion-slide.tsx
 * Last Modified: 2026-02-02
 * Description: Slide 6 - Final insights ARREGLADO para caber en modal
 */

"use client"

import { motion } from "framer-motion"
import { Lightbulb, Rocket } from "lucide-react"
import type { WeeklySummary } from "@/lib/analytics/weekly-summary-calculator"

interface ConclusionSlideProps {
  summary: WeeklySummary
  onClose: () => void
}

export function ConclusionSlide({ summary, onClose }: ConclusionSlideProps) {
  // Generate actionable tips based on data
  const tips = []
  
  if (summary.topPerformer) {
    tips.push(`Double down on content similar to "${summary.topPerformer.title.substring(0, 30)}..."`)
  }
  
  if (summary.engagement.trend === "down") {
    tips.push("Try posting at different times to maximize reach")
    tips.push("Experiment with more visual content (images, videos)")
  } else if (summary.engagement.trend === "up") {
    tips.push("Keep your current posting schedule - it's working!")
    tips.push("Consider increasing post frequency slightly")
  }
  
  if (summary.platformBreakdown.length > 0) {
    const bestPlatform = summary.platformBreakdown.sort((a, b) => b.change - a.change)[0]
    if (bestPlatform.change > 10) {
      const name = bestPlatform.platform === "twitter" ? "X" : "LinkedIn"
      tips.push(`${name} is performing well - allocate more content there`)
    }
  }

  // Fallback tips if no specific insights
  if (tips.length === 0) {
    tips.push("Engage with your audience in the comments")
    tips.push("Post consistently at the same times")
    tips.push("Use relevant hashtags to increase discoverability")
  }

  return (
    <div className="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 p-8 min-h-[600px] max-h-[90vh] overflow-y-auto flex flex-col text-white">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="text-5xl mb-3"
        >
          🎯
        </motion.div>
        <h2
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Key Takeaways
        </h2>
      </motion.div>

      {/* Insights - COMPACTO */}
      <div className="flex-1 space-y-4 mb-6">
        {summary.insights.length > 0 ? (
          summary.insights.slice(0, 3).map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-start gap-3"
            >
              <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{insight}</p>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center"
          >
            <p className="text-sm">Keep up the great work! 🚀</p>
          </motion.div>
        )}

        {/* Action Tips - COMPACTO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/30 backdrop-blur-sm rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-5 h-5" />
            <h3 className="text-lg font-bold">Next Steps</h3>
          </div>
          <ul className="space-y-1.5">
            {tips.slice(0, 3).map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-lg">•</span>
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Close button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={onClose}
        className="w-full py-4 rounded-xl bg-white text-teal-600 font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        🚀 Let's get to work!
      </motion.button>
    </div>
  )
}