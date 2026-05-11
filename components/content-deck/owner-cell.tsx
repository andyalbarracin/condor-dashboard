"use client"

import { UserCircle2 } from "lucide-react"
import * as Tooltip from "@radix-ui/react-tooltip"

interface OwnerCellProps {
  name?: string | null
  avatar?: string | null
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? "")
    .join("")
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-teal-500", "bg-purple-500",
  "bg-orange-500", "bg-green-500", "bg-red-500",
]

function colorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function OwnerCell({ name, avatar }: OwnerCellProps) {
  if (!name) {
    return (
      <div className="flex items-center justify-center">
        <UserCircle2 className="w-6 h-6 text-neutral-300" />
      </div>
    )
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="flex items-center justify-center cursor-default">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${colorForName(name)}`}
              >
                {initials(name)}
              </div>
            )}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 px-2 py-1 text-xs bg-foreground text-background rounded shadow"
            sideOffset={6}
          >
            {name}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
