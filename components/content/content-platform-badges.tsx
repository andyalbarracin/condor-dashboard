"use client"

import { cn } from "@/lib/utils"
import { PLATFORM_CONFIG, type ContentPlatform } from "@/lib/content/types"

interface ContentPlatformBadgesProps {
  platforms: ContentPlatform[]
  max?: number
  className?: string
}

export function ContentPlatformBadges({ platforms, max = 3, className }: ContentPlatformBadgesProps) {
  if (!platforms || platforms.length === 0) return null

  const visible = platforms.slice(0, max)
  const overflow = platforms.length - max

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {visible.map((p) => {
        const cfg = PLATFORM_CONFIG[p]
        return (
          <span
            key={p}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border"
            style={{
              color: cfg.color,
              borderColor: `${cfg.color}30`,
              backgroundColor: `${cfg.color}10`,
            }}
          >
            {cfg.label}
          </span>
        )
      })}
      {overflow > 0 && (
        <span className="text-[10px] text-neutral-400">+{overflow}</span>
      )}
    </div>
  )
}
