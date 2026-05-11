"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { TableGroup } from "./table-group"
import type {
  ContentGroup, BoardItem,
  BoardItemStatus, BoardPlatform, BuyerStage,
} from "@/lib/content-deck/types"

interface TableViewProps {
  groups: ContentGroup[]
  items: BoardItem[]
  onToggleGroupCollapse: (id: string) => void
  onAddItem: (groupId: string, title: string) => void
  onOpenUpdates: (item: BoardItem) => void
  onOpenDetail: (item: BoardItem) => void
  onDuplicateItem: (item: BoardItem) => void
  onStatusChange: (id: string, v: BoardItemStatus) => void
  onPlatformChange: (id: string, v: BoardPlatform | null) => void
  onBuyerStageChange: (id: string, v: BuyerStage | null) => void
  onDeleteItem: (id: string) => void
  onAddGroup: (name: string) => void
  onRenameGroup: (id: string, name: string) => void
  onDuplicateGroup: (id: string) => void
  onDeleteGroup: (id: string) => void
  onColorGroup: (id: string, color: string) => void
}

export function TableView({
  groups, items, onToggleGroupCollapse, onAddItem,
  onOpenUpdates, onOpenDetail, onDuplicateItem,
  onStatusChange, onPlatformChange, onBuyerStageChange, onDeleteItem,
  onAddGroup, onRenameGroup, onDuplicateGroup, onDeleteGroup, onColorGroup,
}: TableViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [addingGroup, setAddingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const commitAddGroup = () => {
    const trimmed = newGroupName.trim()
    if (trimmed) onAddGroup(trimmed)
    setAddingGroup(false)
    setNewGroupName("")
  }

  return (
    <div className="overflow-x-auto pb-4 w-full">
      <div style={{ minWidth: "1060px" }} className="w-full">
        {groups.map(group => {
          const groupItems = items
            .filter(i => i.group_id === group.id)
            .sort((a, b) => a.order_index - b.order_index)

          return (
            <TableGroup
              key={group.id}
              group={group}
              items={groupItems}
              allItems={items}
              selectedIds={selectedIds}
              onToggleCollapse={onToggleGroupCollapse}
              onSelectItem={toggleSelect}
              onAddItem={onAddItem}
              onOpenUpdates={onOpenUpdates}
              onOpenDetail={onOpenDetail}
              onDuplicateItem={onDuplicateItem}
              onStatusChange={onStatusChange}
              onPlatformChange={onPlatformChange}
              onBuyerStageChange={onBuyerStageChange}
              onDeleteItem={onDeleteItem}
              onRenameGroup={onRenameGroup}
              onDuplicateGroup={onDuplicateGroup}
              onDeleteGroup={onDeleteGroup}
              onColorGroup={onColorGroup}
            />
          )
        })}

        {/* Add new group */}
        <div className="mt-2">
          {addingGroup ? (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Plus className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") commitAddGroup()
                  if (e.key === "Escape") { setAddingGroup(false); setNewGroupName("") }
                }}
                onBlur={commitAddGroup}
                autoFocus
                placeholder="Group name…"
                className="text-sm font-semibold bg-transparent border-b border-neutral-300 dark:border-neutral-600 outline-none px-1 py-0.5 min-w-[180px]"
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingGroup(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-neutral-400 hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            >
              <Plus className="w-4 h-4" />
              Add group
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
