"use client"

import { cn } from "@/lib/utils"
import { STATUS_CONFIG, type ContentStatus } from "@/lib/content/types"

interface ContentStatusBadgeProps {
  status: ContentStatus
  className?: string
  size?: "sm" | "md"
}

export function ContentStatusBadge({ status, className, size = "md" }: ContentStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs",
        cfg.bg,
        cfg.color,
        className
      )}
    >
      <span className={cn("rounded-full flex-shrink-0", size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5", cfg.dot)} />
      {cfg.label}
    </span>
  )
}
