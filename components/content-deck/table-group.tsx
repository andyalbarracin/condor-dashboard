"use client"

import { useState, useRef } from "react"
import { ChevronDown, ChevronRight, MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import { TableRow } from "./table-row"
import { AddItemRow } from "./add-item-row"
import { BOARD_STATUS_CONFIG, BOARD_PLATFORM_CONFIG, BUYER_STAGE_CONFIG } from "@/lib/content-deck/status-colors"
import { GROUP_COLORS } from "@/lib/content-deck/types"
import type { ContentGroup, BoardItem, BoardItemStatus, BoardPlatform, BuyerStage } from "@/lib/content-deck/types"

interface TableGroupProps {
  group: ContentGroup
  items: BoardItem[]
  allItems: BoardItem[]
  selectedIds: Set<string>
  onToggleCollapse: (id: string) => void
  onSelectItem: (id: string) => void
  onAddItem: (groupId: string, title: string) => void
  onOpenUpdates: (item: BoardItem) => void
  onOpenDetail: (item: BoardItem) => void
  onDuplicateItem: (item: BoardItem) => void
  onStatusChange: (id: string, v: BoardItemStatus) => void
  onPlatformChange: (id: string, v: BoardPlatform | null) => void
  onBuyerStageChange: (id: string, v: BuyerStage | null) => void
  onDeleteItem: (id: string) => void
  onRenameGroup: (id: string, name: string) => void
  onDuplicateGroup: (id: string) => void
  onDeleteGroup: (id: string) => void
  onColorGroup: (id: string, color: string) => void
}

function SummaryBar({ items, field, config }: {
  items: BoardItem[]
  field: "status" | "platform" | "buyer_stage"
  config: Record<string, { bg: string; label: string }>
}) {
  if (items.length === 0) return <div className="w-[120px] flex-shrink-0 border-l border-border" />
  const counts: Record<string, number> = {}
  for (const item of items) {
    const val = item[field] as string | null
    if (val) counts[val] = (counts[val] ?? 0) + 1
  }
  return (
    <div className="w-[120px] flex-shrink-0 border-l border-border flex items-center px-1">
      <div className="flex h-2 w-full rounded overflow-hidden gap-px">
        {Object.entries(counts).map(([key, count]) => {
          const cfg = config[key]
          if (!cfg) return null
          return <div key={key} className={cn("h-full", cfg.bg)} style={{ flex: count }} title={`${cfg.label}: ${count}`} />
        })}
      </div>
    </div>
  )
}

export function TableGroup({
  group, items, allItems, selectedIds,
  onToggleCollapse, onSelectItem, onAddItem,
  onOpenUpdates, onOpenDetail, onDuplicateItem,
  onStatusChange, onPlatformChange, onBuyerStageChange, onDeleteItem,
  onRenameGroup, onDuplicateGroup, onDeleteGroup, onColorGroup,
}: TableGroupProps) {
  const { color, collapsed } = group
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(group.name)
  const renameRef = useRef<HTMLInputElement>(null)

  const commitRename = () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== group.name) onRenameGroup(group.id, trimmed)
    setRenaming(false)
  }

  return (
    <div className="mb-4">
      {/* Group header */}
      <div className="flex items-center gap-2 px-2 py-1.5 select-none group/header">
        <button
          onClick={() => onToggleCollapse(group.id)}
          className="flex-shrink-0 text-neutral-400 hover:text-foreground transition-colors"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
          }
        </button>

        {renaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") { setRenaming(false); setRenameValue(group.name) }
            }}
            onBlur={commitRename}
            autoFocus
            className="text-sm font-bold bg-transparent border-b-2 outline-none"
            style={{ color, borderColor: color }}
          />
        ) : (
          <button
            className="text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color }}
            onDoubleClick={() => { setRenaming(true); setRenameValue(group.name); setTimeout(() => renameRef.current?.select(), 0) }}
          >
            {group.name}
          </button>
        )}

        <span className="text-xs text-neutral-400 ml-1">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>

        {/* Group context menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="opacity-0 group-hover/header:opacity-100 transition-opacity ml-1 p-0.5 rounded hover:bg-accent flex-shrink-0 focus:outline-none">
              <MoreHorizontal className="w-4 h-4 text-neutral-400" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 w-[200px] bg-popover border border-border rounded-lg shadow-md p-1 text-sm"
              sideOffset={4}
            >
              <DropdownMenu.Item
                onSelect={() => { setRenaming(true); setRenameValue(group.name); setTimeout(() => renameRef.current?.select(), 50) }}
                className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
              >
                <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                Rename group
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onSelect={() => onDuplicateGroup(group.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
              >
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                Duplicate group
              </DropdownMenu.Item>

              {/* Color picker inline sub-menu */}
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-accent">
                  <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  Change color
                  <span className="ml-auto text-neutral-400">›</span>
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    className="z-[60] bg-popover border border-border rounded-lg shadow-md p-2 grid grid-cols-4 gap-1 w-[120px]"
                    sideOffset={4}
                  >
                    {GROUP_COLORS.map(c => (
                      <DropdownMenu.Item
                        key={c}
                        onSelect={() => onColorGroup(group.id, c)}
                        className="w-7 h-7 rounded-md cursor-pointer outline-none hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>

              <DropdownMenu.Separator className="my-1 h-px bg-border" />

              <DropdownMenu.Item
                onSelect={() => {
                  if (!confirm(`Delete group "${group.name}" and all its items?`)) return
                  onDeleteGroup(group.id)
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete group
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {!collapsed && (
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center text-xs font-medium text-neutral-400 border-b border-border" style={{ minWidth: "1000px" }}>
            <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: color }} />
            <div className="w-9 flex-shrink-0" />
            <div className="flex-1 min-w-[200px] px-3 py-2">Task</div>
            <div className="w-[70px] flex-shrink-0 px-2 py-2 border-l border-border text-center">Owner</div>
            <div className="w-[120px] flex-shrink-0 px-2 py-2 border-l border-border text-center">Status</div>
            <div className="w-[120px] flex-shrink-0 px-2 py-2 border-l border-border text-center">Platform</div>
            <div className="w-[120px] flex-shrink-0 px-2 py-2 border-l border-border text-center">Buyer Stage</div>
            <div className="w-[140px] flex-shrink-0 px-2 py-2 border-l border-border text-center">Date</div>
            <div className="w-[100px] flex-shrink-0 px-2 py-2 border-l border-border text-center">Link</div>
            <div className="w-[120px] flex-shrink-0 px-2 py-2 border-l border-border">Dependent on</div>
            <div className="w-[60px] flex-shrink-0 px-2 py-2 border-l border-border text-center">Updates</div>
            <div className="w-[60px] flex-shrink-0 px-2 py-2 border-l border-border text-center">Files</div>
            <div className="w-[40px] flex-shrink-0" />
          </div>

          {/* Item rows */}
          <div style={{ minWidth: "1000px" }}>
            {items.map(item => (
              <TableRow
                key={item.id}
                item={item}
                allItems={allItems}
                accentColor={color}
                isSelected={selectedIds.has(item.id)}
                onSelect={onSelectItem}
                onOpenUpdates={onOpenUpdates}
                onOpenDetail={onOpenDetail}
                onDuplicate={onDuplicateItem}
                onStatusChange={onStatusChange}
                onPlatformChange={onPlatformChange}
                onBuyerStageChange={onBuyerStageChange}
                onDelete={onDeleteItem}
              />
            ))}

            <AddItemRow accentColor={color} onAdd={title => onAddItem(group.id, title)} />

            {/* Summary row */}
            {items.length > 0 && (
              <div className="flex items-center border-t border-border bg-neutral-50/50 dark:bg-neutral-900/30 min-h-[32px]">
                <div className="w-1 flex-shrink-0 self-stretch" style={{ backgroundColor: color }} />
                <div className="w-9 flex-shrink-0" />
                <div className="flex-1 min-w-[200px] px-3 py-1.5" />
                <div className="w-[70px] flex-shrink-0 border-l border-border" />
                <SummaryBar items={items} field="status" config={BOARD_STATUS_CONFIG} />
                <SummaryBar items={items} field="platform" config={BOARD_PLATFORM_CONFIG} />
                <SummaryBar items={items} field="buyer_stage" config={BUYER_STAGE_CONFIG} />
                <div className="w-[140px] flex-shrink-0 border-l border-border flex items-center justify-center px-2 py-1">
                  {(() => {
                    const dated = items.filter(i => i.due_date)
                    if (dated.length === 0) return null
                    const sorted = dated.sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))
                    const first = sorted[0].due_date!
                    const last = sorted[sorted.length - 1].due_date!
                    const fmtD = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
                    return (
                      <span className="text-[10px] font-medium bg-green-500 text-white px-1.5 py-0.5 rounded truncate">
                        {first === last ? fmtD(first) : `${fmtD(first)} – ${fmtD(last)}`}
                      </span>
                    )
                  })()}
                </div>
                <div className="w-[100px] flex-shrink-0 border-l border-border" />
                <div className="w-[120px] flex-shrink-0 border-l border-border" />
                <div className="w-[60px] flex-shrink-0 border-l border-border" />
                <div className="w-[60px] flex-shrink-0 border-l border-border" />
                <div className="w-[40px] flex-shrink-0" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
