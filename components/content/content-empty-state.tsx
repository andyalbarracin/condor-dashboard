"use client"

import { Layers } from "lucide-react"

interface ContentEmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function ContentEmptyState({
  title = "No content items yet",
  description = "Create your first content item to start organizing your editorial workflow.",
  action,
}: ContentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
        <Layers className="w-6 h-6 text-neutral-400" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-neutral-500 max-w-xs mb-4">{description}</p>
      {action}
    </div>
  )
}
