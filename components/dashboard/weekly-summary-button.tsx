/**
 * File: weekly-summary-button.tsx
 * Path: /components/dashboard/weekly-summary-button.tsx
 * Last Modified: 2026-02-02
 * Description: Botón para abrir el Weekly Summary Modal
 */

"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { WeeklySummaryModal } from "./weekly-summary-modal"
import type { ParsedDataset } from "@/lib/parsers/types"

interface WeeklySummaryButtonProps {
  data: ParsedDataset
}

export function WeeklySummaryButton({ data }: WeeklySummaryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          bg-gradient-to-r from-purple-500 to-pink-500 text-white
          hover:from-purple-600 hover:to-pink-600
          shadow-md hover:shadow-lg hover:shadow-purple-500/20"
      >
        <Sparkles className="w-4 h-4" />
        Weekly Summary
      </button>

      <WeeklySummaryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={data}
      />
    </>
  )
}