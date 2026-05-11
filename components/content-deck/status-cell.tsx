"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import { BOARD_STATUS_CONFIG } from "@/lib/content-deck/status-colors"
import { BOARD_STATUSES, type BoardItemStatus } from "@/lib/content-deck/types"

interface StatusCellProps {
  value: BoardItemStatus
  onChange?: (v: BoardItemStatus) => void
  readonly?: boolean
}

export function StatusCell({ value, onChange, readonly }: StatusCellProps) {
  const cfg = BOARD_STATUS_CONFIG[value]

  if (readonly || !onChange) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center px-2 py-1.5 text-xs font-semibold truncate", cfg.bg, cfg.text)}>
        {cfg.label}
      </div>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "w-full h-full flex items-center justify-center px-2 py-1.5 text-xs font-semibold truncate cursor-pointer hover:opacity-90 transition-opacity focus:outline-none",
            cfg.bg, cfg.text
          )}
        >
          {cfg.label}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[160px] bg-popover border border-border rounded-lg shadow-md p-1 text-xs"
          sideOffset={4}
        >
          {BOARD_STATUSES.map(s => {
            const c = BOARD_STATUS_CONFIG[s]
            return (
              <DropdownMenu.Item
                key={s}
                onSelect={() => onChange(s)}
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
