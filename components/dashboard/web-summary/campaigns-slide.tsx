/**
 * File: campaigns-slide.tsx
 * Path: /components/dashboard/web-summary/campaigns-slide.tsx
 * Last Modified: 2026-03-21
 * Description: Web Summary Slide 3 - Top campaigns with performance bars
 */

"use client"

import { motion } from "framer-motion"
import { Sparkles, AlertCircle } from "lucide-react"
import type { WebSummary } from "@/lib/analytics/web-summary-calculator"

interface CampaignsSlideProps {
  summary: WebSummary
}

export function CampaignsSlide({ summary }: CampaignsSlideProps) {
  const hasCampaigns = summary.topCampaigns.length > 0

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950 dark:to-cyan-950 p-12 min-h-[600px] max-h-[90vh] overflow-y-auto flex flex-col">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">
          Campaign Performance
        </p>
        <h2
          className="text-4xl font-bold text-gray-900 dark:text-white"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Your Top Campaigns
        </h2>
      </motion.div>

      <div className="flex-1 space-y-4 mb-6">
        {hasCampaigns ? (
          summary.topCampaigns.map((campaign, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              className={`rounded-2xl p-6 border ${
                idx === 0
                  ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white border-transparent'
                  : 'bg-white dark:bg-slate-800 border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {idx === 0 && <Sparkles className="w-4 h-4" />}
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      idx === 0 ? 'text-white/80' : 'text-neutral-400'
                    }`}>
                      #{idx + 1} {idx === 0 ? '— Top Performer' : ''}
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${
                    idx === 0 ? 'text-white' : 'text-foreground'
                  }`}>
                    {campaign.name}
                  </p>
                  <p className={`text-sm ${
                    idx === 0 ? 'text-white/70' : 'text-neutral-400'
                  }`}>
                    {campaign.sourceMedium}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    idx === 0 ? 'text-white' : 'text-foreground'
                  }`}>
                    {campaign.sessions.toLocaleString()}
                  </p>
                  <p className={`text-xs ${
                    idx === 0 ? 'text-white/70' : 'text-neutral-400'
                  }`}>
                    sessions ({campaign.pct.toFixed(1)}%)
                  </p>
                </div>
              </div>
              
              {/* Bar */}
              <div className={`w-full rounded-full h-1.5 mt-3 ${
                idx === 0 ? 'bg-white/20' : 'bg-neutral-200 dark:bg-neutral-700'
              }`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(campaign.sessions / summary.topCampaigns[0].sessions) * 100}%` }}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                  className={`rounded-full h-1.5 ${
                    idx === 0 ? 'bg-white' : 'bg-blue-500'
                  }`}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <AlertCircle className="w-12 h-12 text-neutral-300 mb-4" />
            <p className="text-neutral-500 text-lg text-center">
              No named campaigns found.
            </p>
            <p className="text-neutral-400 text-sm mt-2 text-center">
              Add UTM parameters to your links to track campaign performance.
            </p>
          </motion.div>
        )}
      </div>

      <div className="text-sm text-gray-500 text-center">
        Use arrow keys to navigate
      </div>
    </div>
  )
}