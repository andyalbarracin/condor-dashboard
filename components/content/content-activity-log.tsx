"use client"

import { ACTIVITY_LABELS } from "@/lib/content/types"
import type { ContentActivity } from "@/lib/content/types"

interface ContentActivityLogProps {
  activity: ContentActivity[]
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

export function ContentActivityLog({ activity }: ContentActivityLogProps) {
  if (activity.length === 0) {
    return <p className="text-sm text-neutral-400 text-center py-4">No activity yet.</p>
  }

  return (
    <div className="space-y-2">
      {activity.map((event) => {
        const label = ACTIVITY_LABELS[event.event_type] ?? event.event_type
        const actor = event.profile?.full_name ?? "Someone"

        return (
          <div key={event.id} className="flex items-start gap-2.5 py-1.5">
            {/* Dot */}
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 flex-shrink-0" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-medium text-foreground">{actor}</span>{" "}
                {label}
                {event.old_value && event.new_value && (
                  <>
                    {" "}
                    <span className="line-through text-neutral-400">{event.old_value}</span>
                    {" → "}
                    <span className="font-medium text-foreground">{event.new_value}</span>
                  </>
                )}
                {!event.old_value && event.new_value && (
                  <span className="text-neutral-500"> · {event.new_value}</span>
                )}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{formatTime(event.created_at)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
