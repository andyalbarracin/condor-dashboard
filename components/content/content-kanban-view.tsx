"use client"

import { useState, useRef } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  pointerWithin,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Plus, Pencil, Check, X } from "lucide-react"
import { ContentCard } from "./content-card"
import { ContentStatusBadge } from "./content-status-badge"
import { CONTENT_STATUSES, STATUS_CONFIG, type ContentStatus } from "@/lib/content/types"
import type { ContentItem } from "@/lib/content/types"
import type { useContentStatuses } from "@/lib/hooks/useContentStatuses"

// ── Draggable card wrapper ──────────────────────────────────────

interface DraggableCardProps {
  item: ContentItem
  onStatusChange: (id: string, status: ContentStatus) => void
  onDelete: (id: string) => void
  onEdit: (item: ContentItem) => void
}

function DraggableCard({ item, onStatusChange, onDelete, onEdit }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div ref={setNodeRef} style={style}>
      <ContentCard
        item={item}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onEdit={onEdit}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLDivElement>}
        isDragging={isDragging}
      />
    </div>
  )
}

// ── Droppable column ───────────────────────────────────────────

interface DroppableColumnProps {
  status: ContentStatus
  items: ContentItem[]
  statusName: string
  onStatusChange: (id: string, status: ContentStatus) => void
  onDelete: (id: string) => void
  onEdit: (item: ContentItem) => void
  onNewItem: (status: ContentStatus) => void
  onRenameStatus: (slug: ContentStatus, name: string) => void
  isOver: boolean
}

function DroppableColumn({
  status,
  items,
  statusName,
  onStatusChange,
  onDelete,
  onEdit,
  onNewItem,
  onRenameStatus,
  isOver,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id: status })
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(statusName)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setEditValue(statusName)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const commitEdit = () => {
    if (editValue.trim() && editValue.trim() !== statusName) {
      onRenameStatus(status, editValue.trim())
    }
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditValue(statusName)
    setEditing(false)
  }

  const cfg = STATUS_CONFIG[status]

  return (
    <div
      className={`flex-shrink-0 w-64 xl:w-72 flex flex-col rounded-xl border transition-colors duration-150 ${
        isOver
          ? "border-primary/50 bg-primary/5 dark:bg-primary/10"
          : "border-border bg-neutral-50/60 dark:bg-neutral-900/40"
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

          {editing ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit()
                  if (e.key === "Escape") cancelEdit()
                }}
                onBlur={commitEdit}
                className="flex-1 min-w-0 text-xs font-semibold bg-transparent border-b border-primary outline-none text-foreground"
              />
              <button onClick={commitEdit} className="p-0.5 text-green-500 hover:text-green-600">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={cancelEdit} className="p-0.5 text-neutral-400 hover:text-neutral-600">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group/header min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">{statusName}</span>
              <button
                onClick={startEdit}
                className="p-0.5 rounded opacity-0 group-hover/header:opacity-100 transition-opacity text-neutral-400 hover:text-foreground"
                title="Rename column"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          <span className="text-xs text-neutral-400 flex-shrink-0 ml-auto">{items.length}</span>
        </div>

        <button
          onClick={() => onNewItem(status)}
          className="ml-2 p-1 rounded hover:bg-accent transition-colors text-neutral-400 hover:text-foreground flex-shrink-0"
          title={`Add to ${statusName}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[120px]"
      >
        {items.length === 0 ? (
          <div
            className={`flex items-center justify-center py-8 rounded-lg border-2 border-dashed transition-colors ${
              isOver ? "border-primary/40 bg-primary/5" : "border-border"
            }`}
          >
            <p className="text-xs text-neutral-400">{isOver ? "Drop here" : "Empty"}</p>
          </div>
        ) : (
          items.map((item) => (
            <DraggableCard
              key={item.id}
              item={item}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Main Kanban component ──────────────────────────────────────

interface ContentKanbanViewProps {
  items: ContentItem[]
  onStatusChange: (id: string, status: ContentStatus) => void
  onDelete: (id: string) => void
  onEdit: (item: ContentItem) => void
  onNewItem: (status: ContentStatus) => void
  getStatusName: ReturnType<typeof useContentStatuses>["getStatusName"]
  onRenameStatus: ReturnType<typeof useContentStatuses>["updateStatusName"]
}

export function ContentKanbanView({
  items,
  onStatusChange,
  onDelete,
  onEdit,
  onNewItem,
  getStatusName,
  onRenameStatus,
}: ContentKanbanViewProps) {
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null)
  const [overColumn, setOverColumn] = useState<ContentStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const byStatus = CONTENT_STATUSES.reduce<Record<ContentStatus, ContentItem[]>>(
    (acc, s) => {
      acc[s] = items.filter((i) => i.status === s)
      return acc
    },
    {} as Record<ContentStatus, ContentItem[]>
  )

  const handleDragStart = (event: DragStartEvent) => {
    const draggedItem = items.find((i) => i.id === event.active.id)
    setActiveItem(draggedItem ?? null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id
    if (overId && CONTENT_STATUSES.includes(overId as ContentStatus)) {
      setOverColumn(overId as ContentStatus)
    } else {
      setOverColumn(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)
    setOverColumn(null)

    if (!over) return

    const targetStatus = over.id as ContentStatus
    if (!CONTENT_STATUSES.includes(targetStatus)) return

    const draggedItem = items.find((i) => i.id === active.id)
    if (!draggedItem || draggedItem.status === targetStatus) return

    onStatusChange(active.id as string, targetStatus)
  }

  const handleDragCancel = () => {
    setActiveItem(null)
    setOverColumn(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-3 min-h-[calc(100vh-260px)]" style={{ minWidth: "max-content" }}>
          {CONTENT_STATUSES.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              items={byStatus[status]}
              statusName={getStatusName(status)}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onEdit={onEdit}
              onNewItem={onNewItem}
              onRenameStatus={onRenameStatus}
              isOver={overColumn === status}
            />
          ))}
        </div>
      </div>

      {/* Drag overlay — ghost card while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div className="rotate-1 scale-105 shadow-xl opacity-95 w-64 xl:w-72">
            <ContentCard
              item={activeItem}
              onStatusChange={() => {}}
              onDelete={() => {}}
              onEdit={() => {}}
              isDragging={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
