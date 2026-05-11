"use client"

import { AlertCircle, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateCellProps {
  value: string | null
  onClick?: () => void
}

function fmtShort(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "2-digit",
  })
}

export function DateCell({ value, onClick }: DateCellProps) {
  if (!value) {
    return (
      <button
        onClick={onClick}
        className="w-full h-full flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <Minus className="w-3 h-3 text-neutral-300" />
      </button>
    )
  }

  const date = new Date(value + "T12:00:00")
  const now = new Date()
  const isOverdue = date < now

  return (
    <button
      onClick={onClick}
      className="w-full h-full flex items-center justify-center px-2 py-1.5"
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold text-white",
          isOverdue ? "bg-red-500" : "bg-green-500"
        )}
      >
        {isOverdue && <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />}
        {fmtShort(value)}
      </span>
    </button>
  )
}
