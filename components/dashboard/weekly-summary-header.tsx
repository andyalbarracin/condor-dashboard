/**
 * File: weekly-summary-header.tsx
 * Path: /components/dashboard/weekly-summary-header.tsx
 * Last Modified: 2026-02-02
 * Description: Header con avatar + botón Weekly Summary
 */

"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { WeeklySummaryModal } from "./weekly-summary-modal"  // ⭐ FIX: ruta relativa correcta
import type { ParsedDataset } from "@/lib/parsers/types"

interface WeeklySummaryHeaderProps {
  data: ParsedDataset
  userName?: string
}

export function WeeklySummaryHeader({ data, userName = "Andy" }: WeeklySummaryHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left: User Greeting */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Hello, {userName}! 👋
            </h2>
            <p className="text-sm text-muted-foreground">
              This is what's happening with your content
            </p>
          </div>
        </div>

        {/* Right: Weekly Summary Button */}
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow group"
          onClick={() => setIsOpen(true)}
        >
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Weekly Summary</h3>
            <p className="text-white/80 text-sm">See how you performed this week</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <WeeklySummaryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={data}
      />
    </>
  )
}