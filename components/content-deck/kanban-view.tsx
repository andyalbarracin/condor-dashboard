"use client"

import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable, useDraggable,
  pointerWithin,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import {
  MessageSquare, Paperclip, Calendar, MoreHorizontal,
  Pencil, Trash2, Copy, GripVertical,
} from "lucide-react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { cn } from "@/lib/utils"
import { BOARD_STATUS_CONFIG, BOARD_PLATFORM_CONFIG } from "@/lib/content-deck/status-colors"
import { BOARD_STATUSES, type BoardItem, type BoardItemStatus } from "@/lib/content-deck/types"

interface KanbanViewProps {
  items: BoardItem[]
  onOpenUpdates: (item: BoardItem) => void
  onOpenDetail: (item: BoardItem) => void
  onStatusChange: (id: string, v: BoardItemStatus) => void
  onDelete: (id: string) => void
  onDuplicate: (item: BoardItem) => void
}

// ── Droppable column ────────────────────────────────────────────

function KanbanColumn({
  status, items, onOpenUpdates, onOpenDetail,
  onStatusChange, onDelete, onDuplicate, draggingId,
}: {
  status: BoardItemStatus
  items: BoardItem[]
  draggingId: string | null
  onOpenUpdates: (item: BoardItem) => void
  onOpenDetail: (item: BoardItem) => void
  onStatusChange: (id: string, v: BoardItemStatus) => void
  onDelete: (id: string) => void
  onDuplicate: (item: BoardItem) => void
}) {
  const cfg = BOARD_STATUS_CONFIG[status]
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-[260px] flex flex-col rounded-xl border transition-colors",
        isOver
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-neutral-50/60 dark:bg-neutral-900/40"
      )}
    >
      {/* Column header */}
      <div className="px-3 py-2.5 border-b border-border flex items-center gap-2 flex-shrink-0">
        <span className={cn("w-2 h-2 rounded-sm flex-shrink-0", cfg.bg)} />
        <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
        <span className="text-xs text-neutral-400 ml-auto">{items.length}</span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px] min-h-[80px]">
        {items.map(item => (
          <KanbanCard
            key={item.id}
            item={item}
            isDragging={item.id === draggingId}
            onOpenUpdates={onOpenUpdates}
            onOpenDetail={onOpenDetail}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))}

        {items.length === 0 && !isOver && (
          <div className="flex items-center justify-center py-6">
            <p className="text-xs text-neutral-300">Drop here</p>
          </div>
        )}
        {isOver && (
          <div className="h-10 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5" />
        )}
      </div>
    </div>
  )
}

// ── Draggable card ──────────────────────────────────────────────

function KanbanCard({
  item, isDragging, onOpenUpdates, onOpenDetail, onDelete, onDuplicate,
}: {
  item: BoardItem
  isDragging: boolean
  onOpenUpdates: (item: BoardItem) => void
  onOpenDetail: (item: BoardItem) => void
  onDelete: (id: string) => void
  onDuplicate: (item: BoardItem) => void
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { item },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border rounded-lg hover:shadow-sm transition-shadow group/card",
        isDragging && "opacity-40"
      )}
    >
      <div className="p-3 space-y-2">
        {/* Title row with drag handle + 3-dot */}
        <div className="flex items-start gap-1.5">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 transition-colors touch-none"
            onClick={e => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          {/* Title */}
          <button
            className="flex-1 text-left text-sm font-medium text-foreground hover:text-blue-500 transition-colors leading-snug"
            onClick={() => onOpenDetail(item)}
          >
            {item.title}
          </button>

          {/* 3-dot menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="flex-shrink-0 opacity-0 group-hover/card:opacity-100 p-0.5 rounded hover:bg-accent transition-opacity focus:outline-none"
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

        {/* Platform badge */}
        {item.platform && (() => {
          const cfg = BOARD_PLATFORM_CONFIG[item.platform]
          return (
            <span className={cn("inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded", cfg.bg, cfg.text)}>
              {cfg.label}
            </span>
          )
        })()}

        {/* Buyer stage */}
        {item.buyer_stage && (
          <p className="text-[10px] text-neutral-400 capitalize">{item.buyer_stage.replace(/_/g, " ")}</p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 pt-0.5">
          {item.due_date && (
            <span className="flex items-center gap-1 text-[10px] text-neutral-400">
              <Calendar className="w-3 h-3" />
              {new Date(item.due_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={e => { e.stopPropagation(); onOpenUpdates(item) }}
              className="flex items-center gap-0.5 text-neutral-400 hover:text-blue-500 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              {(item.updates_count ?? 0) > 0 && <span className="text-[9px]">{item.updates_count}</span>}
            </button>
            {(item.files_count ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-neutral-400 text-[9px]">
                <Paperclip className="w-3 h-3" />{item.files_count}
              </span>
            )}
          </div>
        </div>

        {/* Owner avatar */}
        {item.owner_name && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
              {item.owner_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <span className="text-[10px] text-neutral-400">{item.owner_name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main KanbanView ─────────────────────────────────────────────

export function KanbanView({
  items, onOpenUpdates, onOpenDetail, onStatusChange, onDelete, onDuplicate,
}: KanbanViewProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const draggingItem = draggingId ? items.find(i => i.id === draggingId) ?? null : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDraggingId(active.id as string)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggingId(null)
    if (!over) return
    const newStatus = over.id as BoardItemStatus
    const item = items.find(i => i.id === active.id)
    if (item && item.status !== newStatus) {
      onStatusChange(item.id, newStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[400px] w-full">
        {BOARD_STATUSES.map(status => {
          const colItems = items.filter(i => i.status === status)
          return (
            <KanbanColumn
              key={status}
              status={status}
              items={colItems}
              draggingId={draggingId}
              onOpenUpdates={onOpenUpdates}
              onOpenDetail={onOpenDetail}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          )
        })}
      </div>

      {/* Drag overlay — ghost card while dragging */}
      <DragOverlay>
        {draggingItem && (
          <div className="bg-card border border-primary/40 rounded-lg p-3 shadow-xl w-[260px] opacity-90 rotate-1">
            <p className="text-sm font-medium text-foreground">{draggingItem.title}</p>
            {draggingItem.platform && (
              <span className={cn(
                "inline-block mt-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded",
                BOARD_PLATFORM_CONFIG[draggingItem.platform].bg,
                BOARD_PLATFORM_CONFIG[draggingItem.platform].text
              )}>
                {BOARD_PLATFORM_CONFIG[draggingItem.platform].label}
              </span>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
