"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import { useContentBoard } from "@/lib/hooks/useContentBoard"
import { useWorkspaceMembers } from "@/lib/hooks/useWorkspaceMembers"
import { BoardHeader } from "@/components/content-deck/board-header"
import { TableView } from "@/components/content-deck/table-view"
import { KanbanView } from "@/components/content-deck/kanban-view"
import { CalendarView } from "@/components/content-deck/calendar-view"
import { GanttView } from "@/components/content-deck/gantt-view"
import { FilesView } from "@/components/content-deck/files-view"
import { UpdatesPanel } from "@/components/content-deck/updates-panel"
import { TaskDetailPanel } from "@/components/content-deck/task-detail-panel"
import { ImportBoardModal } from "@/components/content-deck/import-board-modal"
import { exportContentBoard } from "@/lib/content-deck/exporters/content-board-exporter"
import type { BoardView, BoardItem, ContentGroup } from "@/lib/content-deck/types"

function BoardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 w-full">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-48" />
      <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-40" />
          <div className="border border-border rounded-lg overflow-hidden">
            {[1, 2, 3].map(j => (
              <div key={j} className="h-9 bg-neutral-100 dark:bg-neutral-900 border-b border-border last:border-0" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ContentDeckPage() {
  const [sidebarOpen, setSidebarOpen] = useSidebarState()
  const [view, setView] = useState<BoardView>("table")
  const [search, setSearch] = useState("")
  const [updatesItem, setUpdatesItem] = useState<BoardItem | null>(null)
  const [detailItem, setDetailItem] = useState<BoardItem | null>(null)
  const [showImport, setShowImport] = useState(false)

  const {
    boards, board, groups, items, workspaceId, workspaceName,
    isLoading, isMock,
    switchBoard, createBoard, updateBoard, deleteBoard, duplicateBoard,
    createItem, updateItem, deleteItem,
    createGroup, updateGroup, deleteGroup, duplicateGroup,
    toggleGroupCollapsed,
  } = useContentBoard()

  const { members } = useWorkspaceMembers(workspaceId)

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      (i.owner_name?.toLowerCase().includes(q) ?? false)
    )
  }, [items, search])

  const handleAddItem = async (groupId: string, title: string) => {
    if (!title.trim()) return
    await createItem({
      workspace_id: workspaceId ?? board?.workspace_id ?? "mock-workspace",
      board_id: board?.id ?? "mock-board-001",
      group_id: groupId,
      title: title.trim(),
      status: "not_started",
      order_index: items.filter(i => i.group_id === groupId).length,
    })
  }

  const handleNewTask = () => {
    const firstGroup = groups.find(g => !g.collapsed) ?? groups[0]
    if (firstGroup) handleAddItem(firstGroup.id, "New Task")
  }

  const handleDuplicateItem = async (item: BoardItem) => {
    await createItem({
      workspace_id: item.workspace_id,
      board_id: item.board_id,
      group_id: item.group_id,
      title: `${item.title} (copy)`,
      status: item.status,
      platform: item.platform ?? undefined,
      buyer_stage: item.buyer_stage ?? undefined,
      due_date: item.due_date ?? undefined,
      start_date: item.start_date ?? undefined,
      link_url: item.link_url ?? undefined,
      order_index: items.filter(i => i.group_id === item.group_id).length,
    })
  }

  const handleUpdateItem = (id: string, payload: Partial<BoardItem>) => {
    updateItem(id, payload as Parameters<typeof updateItem>[1])
    setDetailItem(prev => prev?.id === id ? { ...prev, ...payload } : prev)
  }

  const handleDeleteItem = (id: string) => {
    if (!confirm("Delete this item?")) return
    deleteItem(id)
    if (detailItem?.id === id) setDetailItem(null)
  }

  const handleExportBoard = (boardId?: string) => {
    const targetBoard = boardId ? boards.find(b => b.id === boardId) : board
    if (!targetBoard) return
    const targetGroups = boardId === board?.id ? groups : []
    const targetItems = boardId === board?.id ? items : []
    exportContentBoard(targetBoard, targetGroups, targetItems)
  }

  const handleImport = (importedGroups: ContentGroup[], importedItems: BoardItem[], boardName?: string) => {
    console.log("Imported:", boardName, importedGroups.length, "groups,", importedItems.length, "items")
    alert(`Imported ${importedGroups.length} groups and ${importedItems.length} items.\nRun the SQL migration and re-import to persist to the database.`)
  }

  const detailGroup = detailItem ? groups.find(g => g.id === detailItem.group_id) : undefined

  return (
    // Exact same pattern as Reports page: h-screen overflow-hidden + explicit width on main
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? "16rem" : "5rem",
          width: sidebarOpen ? "calc(100vw - 16rem)" : "calc(100vw - 5rem)",
        }}
      >
        <Header />

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-8 py-6 w-full">
            {isLoading ? (
              <BoardSkeleton />
            ) : (
              <>
                {/* Board header — always full width */}
                <BoardHeader
                  boards={boards}
                  board={board}
                  workspaceName={workspaceName}
                  view={view}
                  onViewChange={setView}
                  search={search}
                  onSearchChange={setSearch}
                  onNewTask={handleNewTask}
                  onExport={() => handleExportBoard()}
                  onExportBoard={handleExportBoard}
                  onImport={() => setShowImport(true)}
                  isMock={isMock}
                  onSwitchBoard={switchBoard}
                  onCreateBoard={createBoard}
                  onRenameBoard={(id, name) => updateBoard(id, { name })}
                  onDuplicateBoard={duplicateBoard}
                  onDeleteBoard={deleteBoard}
                />

                {/* View content — always full width */}
                <div className="mt-4 w-full">
                  {view === "table" && (
                    <TableView
                      groups={groups}
                      items={filteredItems}
                      onToggleGroupCollapse={toggleGroupCollapsed}
                      onAddItem={handleAddItem}
                      onOpenUpdates={setUpdatesItem}
                      onOpenDetail={setDetailItem}
                      onDuplicateItem={handleDuplicateItem}
                      onStatusChange={(id, v) => handleUpdateItem(id, { status: v })}
                      onPlatformChange={(id, v) => handleUpdateItem(id, { platform: v })}
                      onBuyerStageChange={(id, v) => handleUpdateItem(id, { buyer_stage: v })}
                      onDeleteItem={handleDeleteItem}
                      onAddGroup={async name => { await createGroup(name) }}
                      onRenameGroup={async (id, name) => { await updateGroup(id, { name }) }}
                      onDuplicateGroup={async id => { await duplicateGroup(id) }}
                      onDeleteGroup={async id => { await deleteGroup(id) }}
                      onColorGroup={async (id, color) => { await updateGroup(id, { color }) }}
                    />
                  )}

                  {view === "kanban" && (
                    <KanbanView
                      items={filteredItems}
                      onOpenUpdates={setUpdatesItem}
                      onOpenDetail={setDetailItem}
                      onStatusChange={(id, v) => handleUpdateItem(id, { status: v })}
                      onDelete={handleDeleteItem}
                      onDuplicate={handleDuplicateItem}
                    />
                  )}

                  {view === "gantt" && (
                    <GanttView groups={groups} items={filteredItems} />
                  )}

                  {view === "calendar" && (
                    <CalendarView
                      items={filteredItems}
                      onOpenUpdates={setUpdatesItem}
                      onOpenDetail={setDetailItem}
                    />
                  )}

                  {view === "files" && (
                    <FilesView items={filteredItems} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <TaskDetailPanel
        item={detailItem}
        groupName={detailGroup?.name}
        groupColor={detailGroup?.color}
        allItems={items}
        members={members}
        onClose={() => setDetailItem(null)}
        onUpdateItem={handleUpdateItem}
        onDelete={handleDeleteItem}
      />

      <UpdatesPanel
        item={updatesItem}
        onClose={() => setUpdatesItem(null)}
        members={members}
      />

      <ImportBoardModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        board={board}
        workspaceId={workspaceId}
      />
    </div>
  )
}
