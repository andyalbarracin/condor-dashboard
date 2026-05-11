"use client"

import { useRouter } from "next/navigation"
import { Calendar, MoreHorizontal, Trash2, Archive, Pencil, ExternalLink, GripVertical } from "lucide-react"
import { ContentStatusBadge } from "./content-status-badge"
import { ContentPlatformBadges } from "./content-platform-badges"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from "@/components/ui/select"
import {
  CONTENT_STATUSES, STATUS_CONFIG, type ContentStatus,
} from "@/lib/content/types"
import type { ContentItem } from "@/lib/content/types"

interface ContentCardProps {
  item: ContentItem
  onStatusChange: (id: string, status: ContentStatus) => void
  onDelete: (id: string) => void
  onEdit: (item: ContentItem) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  isDragging?: boolean
}

export function ContentCard({
  item,
  onStatusChange,
  onDelete,
  onEdit,
  dragHandleProps,
  isDragging,
}: ContentCardProps) {
  const router = useRouter()

  const dueDate = item.due_date
    ? new Date(item.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null

  const isOverdue =
    item.due_date &&
    new Date(item.due_date) < new Date() &&
    !["published", "archived"].includes(item.status)

  return (
    <div
      className={`group bg-card border border-border rounded-lg p-3 transition-all select-none ${
        isDragging
          ? "opacity-50 shadow-lg border-primary/40"
          : "hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-1.5 mb-2">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="flex-shrink-0 mt-0.5 p-0.5 rounded cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>

        {/* Title — clickable */}
        <p
          className="text-sm font-medium text-foreground leading-snug line-clamp-2 flex-1 cursor-pointer"
          onClick={() => router.push(`/content/${item.id}`)}
        >
          {item.title}
        </p>

        {/* Actions */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded hover:bg-accent transition-colors"
            title="Edit"
          >
            <Pencil className="w-3 h-3 text-neutral-400" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-accent transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => router.push(`/content/${item.id}`)}>
                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                Open detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {item.status !== "archived" && (
                <DropdownMenuItem onClick={() => onStatusChange(item.id, "archived")}>
                  <Archive className="w-3.5 h-3.5 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Platforms */}
      {item.platforms.length > 0 && (
        <div onClick={(e) => e.stopPropagation()}>
          <ContentPlatformBadges platforms={item.platforms} className="mb-2 pl-5" />
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between mt-2 pl-5"
        onClick={(e) => e.stopPropagation()}
      >
        <Select
          value={item.status}
          onValueChange={(v) => onStatusChange(item.id, v as ContentStatus)}
        >
          <SelectTrigger className="h-6 border-none bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0 w-auto text-xs">
            <ContentStatusBadge status={item.status} size="sm" />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  {STATUS_CONFIG[s].label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {dueDate && (
          <span
            className={`flex items-center gap-1 text-[10px] ${
              isOverdue ? "text-red-500" : "text-neutral-400"
            }`}
          >
            <Calendar className="w-3 h-3" />
            {dueDate}
          </span>
        )}
      </div>
    </div>
  )
}
