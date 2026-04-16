/**
 * File: conclusion-slide.tsx
 * Path: /components/dashboard/web-summary/conclusion-slide.tsx
 * Last Modified: 2026-03-21
 * Description: Web Summary Slide 4 - Insights and next steps
 */

"use client"

import { motion } from "framer-motion"
import { Lightbulb, Rocket } from "lucide-react"
import type { WebSummary } from "@/lib/analytics/web-summary-calculator"

interface ConclusionSlideProps {
  summary: WebSummary
  onClose: () => void
}

export function WebConclusionSlide({ summary, onClose }: ConclusionSlideProps) {
  const tips: string[] = []

  if (summary.topCampaign) {
    tips.push(`Double down on "${summary.topCampaign.name}" — it's your best performing campaign`)
  }

  const directPct = summary.mediumBreakdown.find(m => m.medium.toLowerCase() === 'direct')?.pct || 0
  if (directPct > 40) {
    tips.push('Add UTM parameters to all your social media links for better tracking')
  }

  const organicPct = summary.mediumBreakdown.find(m => m.medium.toLowerCase() === 'organic')?.pct || 0
  if (organicPct < 10) {
    tips.push('Invest in SEO to grow your organic traffic')
  } else if (organicPct > 25) {
    tips.push('Your SEO is paying off — keep creating search-friendly content')
  }

  if (summary.topCampaigns.length < 3) {
    tips.push('Create more UTM-tracked campaigns to better understand your traffic sources')
  }

  if (tips.length === 0) {
    tips.push('Review your analytics monthly to spot trends')
    tips.push('Set up goal tracking in GA4 for conversion insights')
    tips.push('A/B test your landing pages to improve engagement')
  }

  return (
    <div className="bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400 p-8 min-h-[600px] max-h-[90vh] overflow-y-auto flex flex-col text-white">
      
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

      {/* Insights */}
      <div className="flex-1 space-y-4 mb-6">
        {summary.insights.length > 0 ? (
          summary.insights.slice(0, 4).map((insight, index) => (
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
            <p className="text-sm">Your web analytics are looking good! 🚀</p>
          </motion.div>
        )}

        {/* Tips */}
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

      {/* Close */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={onClose}
        className="w-full py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        🚀 Back to Dashboard
      </motion.button>
    </div>
  )
}