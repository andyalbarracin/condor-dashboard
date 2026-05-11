"use client"

import { useState, useRef } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
  ChevronDown, Plus, Pencil, Copy, Trash2,
  ExternalLink, Download, FileText, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ContentBoard } from "@/lib/content-deck/types"

interface BoardSwitcherProps {
  boards: ContentBoard[]
  activeBoard: ContentBoard | null
  onSwitch: (id: string) => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onExport: (id: string) => void
  isMock: boolean
}

export function BoardSwitcher({
  boards, activeBoard, onSwitch, onCreate,
  onRename, onDuplicate, onDelete, onExport, isMock,
}: BoardSwitcherProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [creating, setCreating] = useState(false)
  const [createValue, setCreateValue] = useState("")
  const renameInputRef = useRef<HTMLInputElement>(null)
  const createInputRef = useRef<HTMLInputElement>(null)

  const commitRename = (id: string) => {
    const trimmed = renameValue.trim()
    if (trimmed) onRename(id, trimmed)
    setRenamingId(null)
  }

  const commitCreate = () => {
    const trimmed = createValue.trim()
    if (trimmed) onCreate(trimmed)
    setCreating(false)
    setCreateValue("")
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-1.5 group focus:outline-none">
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {activeBoard?.name ?? "Content Board"}
          </span>
          <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-primary transition-colors mt-0.5" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[280px] bg-popover border border-border rounded-xl shadow-xl p-1.5"
          sideOffset={8}
          align="start"
        >
          <div className="px-2 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
            Pages
          </div>

          {boards.map(b => (
            <div key={b.id} className="group/item relative">
              {renamingId === b.id ? (
                <div className="px-2 py-1.5">
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") commitRename(b.id)
                      if (e.key === "Escape") setRenamingId(null)
                    }}
                    onBlur={() => commitRename(b.id)}
                    autoFocus
                    className="w-full text-sm bg-accent border border-border rounded px-2 py-1 outline-none"
                  />
                </div>
              ) : (
                <DropdownMenu.Item
                  onSelect={() => onSwitch(b.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer outline-none text-sm",
                    b.id === activeBoard?.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent"
                  )}
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                  <span className="flex-1 truncate">{b.name}</span>
                  {b.id === activeBoard?.id && <Check className="w-3.5 h-3.5 flex-shrink-0" />}

                  {/* Per-board actions — stop propagation so click doesn't switch board */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <span
                        className="opacity-0 group-hover/item:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 flex-shrink-0 transition-opacity"
                        onClick={e => e.stopPropagation()}
                        onPointerDown={e => e.stopPropagation()}
                      >
                        <span className="text-neutral-400 text-sm leading-none">···</span>
                      </span>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="z-[60] w-[200px] bg-popover border border-border rounded-lg shadow-lg p-1 text-sm"
                        sideOffset={4}
                      >
                        <DropdownMenu.Item
                          onSelect={() => {
                            setRenamingId(b.id)
                            setRenameValue(b.name)
                            setTimeout(() => renameInputRef.current?.select(), 50)
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
                        >
                          <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                          Rename
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          onSelect={() => onDuplicate(b.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
                        >
                          <Copy className="w-3.5 h-3.5 text-neutral-400" />
                          Duplicate
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          onSelect={() => onExport(b.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
                        >
                          <Download className="w-3.5 h-3.5 text-neutral-400" />
                          Export
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          onSelect={() => window.open(`/content-deck?board=${b.id}`, "_blank")}
                          className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-accent"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                          Open in new tab
                        </DropdownMenu.Item>

                        <DropdownMenu.Separator className="my-1 h-px bg-border" />

                        <DropdownMenu.Item
                          onSelect={() => {
                            if (!confirm(`Delete page "${b.name}"? This cannot be undone.`)) return
                            onDelete(b.id)
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </DropdownMenu.Item>
              )}
            </div>
          ))}

          <DropdownMenu.Separator className="my-1.5 h-px bg-border" />

          {/* New page */}
          {creating ? (
            <div className="px-2 py-1.5 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <input
                ref={createInputRef}
                value={createValue}
                onChange={e => setCreateValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") commitCreate()
                  if (e.key === "Escape") { setCreating(false); setCreateValue("") }
                }}
                onBlur={commitCreate}
                autoFocus
                placeholder="Page name…"
                className="flex-1 text-sm bg-accent border border-border rounded px-2 py-1 outline-none"
              />
            </div>
          ) : (
            <DropdownMenu.Item
              onSelect={e => {
                e.preventDefault()
                setCreating(true)
                setTimeout(() => createInputRef.current?.focus(), 50)
              }}
              className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer outline-none hover:bg-accent text-sm text-neutral-500"
            >
              <Plus className="w-3.5 h-3.5" />
              New page
            </DropdownMenu.Item>
          )}

          {isMock && (
            <p className="text-[10px] text-neutral-400 px-2 pb-1 pt-0.5">
              Run SQL migration to persist boards
            </p>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
