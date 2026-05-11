"use client"

import { Table2, Kanban, Calendar, BarChart2, FileText, Plus, Search, Filter, ChevronDown, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { BoardSwitcher } from "./board-switcher"
import type { BoardView, ContentBoard } from "@/lib/content-deck/types"

interface BoardHeaderProps {
  boards: ContentBoard[]
  board: ContentBoard | null
  workspaceName: string | null
  view: BoardView
  onViewChange: (v: BoardView) => void
  search: string
  onSearchChange: (v: string) => void
  onNewTask: () => void
  onExport: () => void
  onExportBoard: (boardId: string) => void
  onImport: () => void
  isMock: boolean
  onSwitchBoard: (id: string) => void
  onCreateBoard: (name: string) => void
  onRenameBoard: (id: string, name: string) => void
  onDuplicateBoard: (id: string) => void
  onDeleteBoard: (id: string) => void
}

const VIEWS: { key: BoardView; label: string; icon: React.ElementType }[] = [
  { key: "table",    label: "Main Table", icon: Table2 },
  { key: "kanban",   label: "Kanban",     icon: Kanban },
  { key: "gantt",    label: "Gantt",      icon: BarChart2 },
  { key: "calendar", label: "Calendar",   icon: Calendar },
  { key: "files",    label: "Files",      icon: FileText },
]

export function BoardHeader({
  boards, board, workspaceName, view, onViewChange,
  search, onSearchChange, onNewTask, onExport, onExportBoard, onImport, isMock,
  onSwitchBoard, onCreateBoard, onRenameBoard, onDuplicateBoard, onDeleteBoard,
}: BoardHeaderProps) {
  return (
    <div className="border-b border-border">
      {/* Breadcrumb + board title row */}
      <div className="flex items-center justify-between py-3 gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {workspaceName && (
            <>
              <span className="text-sm text-neutral-400 truncate max-w-[120px] hidden sm:block">
                {workspaceName}
              </span>
              <span className="text-neutral-300 hidden sm:block">/</span>
            </>
          )}

          <BoardSwitcher
            boards={boards}
            activeBoard={board}
            onSwitch={onSwitchBoard}
            onCreate={onCreateBoard}
            onRename={onRenameBoard}
            onDuplicate={onDuplicateBoard}
            onDelete={onDeleteBoard}
            onExport={onExportBoard}
            isMock={isMock}
          />

          {isMock && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex-shrink-0">
              Demo data
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onImport}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Import
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
        {VIEWS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0",
              view === key
                ? "border-primary text-primary"
                : "border-transparent text-neutral-500 hover:text-foreground hover:border-neutral-300"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
        <button className="flex items-center gap-1 px-3 py-2.5 text-sm text-neutral-400 hover:text-foreground transition-colors border-b-2 border-transparent flex-shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-none">
        <button
          onClick={onNewTask}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          New task
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
        </button>

        <div className="flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-lg bg-background flex-shrink-0">
          <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search"
            className="text-sm bg-transparent border-none outline-none w-28 placeholder:text-neutral-400"
          />
        </div>

        <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-neutral-500 hover:bg-accent rounded-lg transition-colors flex-shrink-0">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
      </div>
    </div>
  )
}
