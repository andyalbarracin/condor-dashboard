"use client"

import { useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Upload, X, Check, AlertCircle, FileSpreadsheet } from "lucide-react"
import { parseMondayExcel, type MondayParseResult } from "@/lib/content-deck/importers/monday-excel-parser"
import type { ContentBoard, ContentGroup, BoardItem, BoardItemStatus, BoardPlatform, BuyerStage } from "@/lib/content-deck/types"
import { GROUP_COLORS } from "@/lib/content-deck/types"

interface ImportBoardModalProps {
  open: boolean
  onClose: () => void
  onImport: (groups: ContentGroup[], items: BoardItem[], boardName?: string) => void
  board: ContentBoard | null
  workspaceId: string | null
}

function buildGroupsAndItems(
  result: MondayParseResult,
  board: ContentBoard | null,
  workspaceId: string | null
): { groups: ContentGroup[]; items: BoardItem[] } {
  const boardId = board?.id ?? "mock-board-001"
  const wsId = workspaceId ?? board?.workspace_id ?? "mock-workspace"
  const now = new Date().toISOString()

  const groups: ContentGroup[] = result.groups.map((g, i) => ({
    id: `imported-grp-${Date.now()}-${i}`,
    board_id: boardId,
    name: g.name,
    color: GROUP_COLORS[i % GROUP_COLORS.length],
    order_index: i,
    collapsed: false,
    created_at: now,
    updated_at: now,
  }))

  const items: BoardItem[] = []
  result.groups.forEach((g, gi) => {
    const group = groups[gi]
    g.items.forEach((item, ii) => {
      items.push({
        id: `imported-item-${Date.now()}-${gi}-${ii}`,
        workspace_id: wsId,
        board_id: boardId,
        group_id: group.id,
        title: item.title,
        owner_id: null,
        status: (item.status as BoardItemStatus) ?? "not_started",
        platform: (item.platform as BoardPlatform) ?? null,
        buyer_stage: (item.buyer_stage as BuyerStage) ?? null,
        due_date: item.due_date,
        start_date: null,
        link_url: item.link_url,
        dependency_item_id: null,
        order_index: ii,
        priority: null,
        item_type: null,
        created_by: null,
        created_at: now,
        updated_at: now,
        owner_name: item.owner_name,
        owner_avatar: null,
        updates_count: 0,
        files_count: 0,
      })
    })
  })

  return { groups, items }
}

export function ImportBoardModal({ open, onClose, onImport, board, workspaceId }: ImportBoardModalProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [parseResult, setParseResult] = useState<MondayParseResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const reset = () => {
    setParseResult(null)
    setError(null)
    setFileName(null)
  }

  const processFile = async (file: File) => {
    setFileName(file.name)
    setError(null)
    setParseResult(null)

    try {
      const buf = await file.arrayBuffer()
      const result = parseMondayExcel(buf)
      setParseResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleImport = () => {
    if (!parseResult) return
    const { groups, items } = buildGroupsAndItems(parseResult, board, workspaceId)
    onImport(groups, items, parseResult.board_name)
    onClose()
    reset()
  }

  const totalItems = parseResult?.groups.reduce((s, g) => s + g.items.length, 0) ?? 0

  return (
    <Dialog.Root open={open} onOpenChange={v => { if (!v) { onClose(); reset() } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[540px] max-w-[95vw] bg-background border border-border rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-base font-semibold">Import Board</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <p className="text-sm text-neutral-500 mb-4">
            Import a monday.com Excel export or any CSV/XLSX file with board data.
          </p>

          {/* Drop zone */}
          {!parseResult && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileSpreadsheet className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Drop your file here</p>
              <p className="text-xs text-neutral-400 mt-1">or click to browse · .xlsx, .xls, .csv</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Parse error</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Parse result preview */}
          {parseResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">{fileName}</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    Found {parseResult.groups.length} groups · {totalItems} items
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="text-xs text-neutral-400 hover:text-foreground transition-colors"
                >
                  Change
                </button>
              </div>

              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Preview</div>

              <div className="border border-border rounded-lg overflow-hidden max-h-[240px] overflow-y-auto">
                {parseResult.groups.map((g, i) => (
                  <div key={i}>
                    <div className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900/40 text-xs font-semibold border-b border-border">
                      {g.name} <span className="font-normal text-neutral-400">· {g.items.length} items</span>
                    </div>
                    {g.items.slice(0, 3).map((item, j) => (
                      <div key={j} className="px-3 py-1.5 text-xs border-b border-border last:border-0 text-foreground">
                        {item.title}
                        {item.status !== "not_started" && (
                          <span className="ml-2 text-neutral-400 capitalize">{item.status.replace(/_/g, " ")}</span>
                        )}
                      </div>
                    ))}
                    {g.items.length > 3 && (
                      <div className="px-3 py-1.5 text-xs text-neutral-400 border-b border-border">
                        +{g.items.length - 3} more items
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {parseResult.warnings.length > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
                  {parseResult.warnings.map((w, i) => (
                    <p key={i}>⚠ {w}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => { onClose(); reset() }}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!parseResult || totalItems === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import {totalItems > 0 ? `${totalItems} items` : ""}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
