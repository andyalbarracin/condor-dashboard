"use client"

import { MessageSquare, Paperclip, ExternalLink, MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import { StatusCell } from "./status-cell"
import { PlatformCell } from "./platform-cell"
import { BuyerStageCell } from "./buyer-stage-cell"
import { DateCell } from "./date-cell"
import { OwnerCell } from "./owner-cell"
import type { BoardItem, BoardItemStatus, BoardPlatform, BuyerStage } from "@/lib/content-deck/types"

interface TableRowProps {
  item: BoardItem
  allItems: BoardItem[]
  accentColor: string
  isSelected: boolean
  onSelect: (id: string) => void
  onOpenUpdates: (item: BoardItem) => void
  onOpenDetail: (item: BoardItem) => void
  onStatusChange: (id: string, v: BoardItemStatus) => void
  onPlatformChange: (id: string, v: BoardPlatform | null) => void
  onBuyerStageChange: (id: string, v: BuyerStage | null) => void
  onDelete: (id: string) => void
  onDuplicate: (item: BoardItem) => void
}

export function TableRow({
  item, allItems, accentColor, isSelected,
  onSelect, onOpenUpdates, onOpenDetail, onStatusChange,
  onPlatformChange, onBuyerStageChange, onDelete, onDuplicate,
}: TableRowProps) {
  const depItem = item.dependency_item_id
    ? allItems.find(i => i.id === item.dependency_item_id)
    : null

  return (
    <div
      className={cn(
        "flex items-stretch border-b border-border last:border-0 group min-h-[36px] text-sm",
        isSelected
          ? "bg-blue-50 dark:bg-blue-950/40"
          : "hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40"
      )}
    >
      {/* Accent bar — w-1 = 4px */}
      <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: accentColor }} />

      {/* Checkbox — w-9 = 36px */}
      <div className="w-9 flex-shrink-0 flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(item.id)}
          className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer"
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* Task title — flex-1 min-w-[200px] (matches header) */}
      <div className="flex-1 flex items-center px-3 py-1.5 min-w-[200px]">
        <button
          className="flex-1 text-left truncate font-medium text-foreground hover:text-blue-500 transition-colors"
          onClick={() => onOpenDetail(item)}
        >
          {item.title}
        </button>
      </div>

      {/* Owner — w-[70px] */}
      <div className="w-[70px] flex-shrink-0 flex items-center justify-center border-l border-border">
        <OwnerCell name={item.owner_name} avatar={item.owner_avatar} />
      </div>

      {/* Status — w-[120px] */}
      <div className="w-[120px] flex-shrink-0 border-l border-border">
        <StatusCell value={item.status} onChange={v => onStatusChange(item.id, v)} />
      </div>

      {/* Platform — w-[120px] */}
      <div className="w-[120px] flex-shrink-0 border-l border-border">
        <PlatformCell value={item.platform} onChange={v => onPlatformChange(item.id, v)} />
      </div>

      {/* Buyer Stage — w-[120px] */}
      <div className="w-[120px] flex-shrink-0 border-l border-border">
        <BuyerStageCell value={item.buyer_stage} onChange={v => onBuyerStageChange(item.id, v)} />
      </div>

      {/* Date — w-[140px] */}
      <div className="w-[140px] flex-shrink-0 border-l border-border">
        <DateCell value={item.due_date} />
      </div>

      {/* Link — w-[100px] */}
      <div className="w-[100px] flex-shrink-0 border-l border-border flex items-center justify-center">
        {item.link_url ? (
          <a
            href={item.link_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs"
          >
            <ExternalLink className="w-3 h-3" />
            Link
          </a>
        ) : (
          <span className="text-xs text-neutral-300">N/A</span>
        )}
      </div>

      {/* Dependent on — w-[120px] */}
      <div className="w-[120px] flex-shrink-0 border-l border-border flex items-center px-2">
        <span className="text-xs text-neutral-400 truncate">
          {depItem ? depItem.title : "N/A"}
        </span>
      </div>

      {/* Updates — w-[60px] */}
      <div className="w-[60px] flex-shrink-0 border-l border-border flex items-center justify-center">
        <button
          onClick={e => { e.stopPropagation(); onOpenUpdates(item) }}
          className="flex items-center gap-0.5 text-neutral-400 hover:text-blue-500 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {(item.updates_count ?? 0) > 0 && (
            <span className="text-[10px] font-medium">{item.updates_count}</span>
          )}
        </button>
      </div>

      {/* Files — w-[60px] */}
      <div className="w-[60px] flex-shrink-0 border-l border-border flex items-center justify-center">
        <span className="flex items-center gap-0.5 text-neutral-400">
          <Paperclip className="w-3.5 h-3.5" />
          {(item.files_count ?? 0) > 0 && (
            <span className="text-[10px] font-medium">{item.files_count}</span>
          )}
        </span>
      </div>

      {/* Actions — w-[40px] — MATCHES header's empty w-[40px] column */}
      <div className="w-[40px] flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="p-1 rounded hover:bg-accent focus:outline-none"
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[160px] bg-popover border border-border rounded-lg shadow-md p-1 text-sm"
              sideOffset={4}
              align="end"
            >
              <DropdownMenu.Item
                onSelect={() => onOpenDetail(item)}
                className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
              >
                <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                Open / Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => onDuplicate(item)}
                className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
              >
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                Duplicate
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item
                onSelect={() => onDelete(item.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  )
}
