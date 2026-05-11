"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { BOARD_PLATFORM_CONFIG } from "@/lib/content-deck/status-colors"
import { BOARD_PLATFORMS, type BoardPlatform } from "@/lib/content-deck/types"

interface PlatformCellProps {
  value: BoardPlatform | null
  onChange?: (v: BoardPlatform | null) => void
  readonly?: boolean
}

export function PlatformCell({ value, onChange, readonly }: PlatformCellProps) {
  const cfg = value ? BOARD_PLATFORM_CONFIG[value] : null

  const inner = cfg ? (
    <span className="text-xs font-semibold truncate">{cfg.label}</span>
  ) : (
    <Minus className="w-3 h-3 text-neutral-300" />
  )

  if (readonly || !onChange) {
    return (
      <div className={cn(
        "w-full h-full flex items-center justify-center px-2 py-1.5",
        cfg ? `${cfg.bg} ${cfg.text}` : "bg-transparent"
      )}>
        {inner}
      </div>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "w-full h-full flex items-center justify-center px-2 py-1.5 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none",
            cfg ? `${cfg.bg} ${cfg.text}` : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
          )}
        >
          {inner}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[160px] bg-popover border border-border rounded-lg shadow-md p-1 text-xs"
          sideOffset={4}
        >
          <DropdownMenu.Item
            onSelect={() => onChange(null)}
            className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
          >
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0 bg-neutral-200 dark:bg-neutral-700" />
            None
          </DropdownMenu.Item>
          {BOARD_PLATFORMS.map(p => {
            const c = BOARD_PLATFORM_CONFIG[p]
            return (
              <DropdownMenu.Item
                key={p}
                onSelect={() => onChange(p)}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
              >
                <span className={cn("w-2.5 h-2.5 rounded-sm flex-shrink-0", c.bg)} />
                {c.label}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
