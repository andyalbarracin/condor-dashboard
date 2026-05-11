"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, ExternalLink, Clock, MessageSquare, Send, Paperclip, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskEditor } from "./task-editor"
import { StatusCell } from "./status-cell"
import { PlatformCell } from "./platform-cell"
import { BuyerStageCell } from "./buyer-stage-cell"
import { OwnerCell } from "./owner-cell"
import { useContentUpdates } from "@/lib/hooks/useContentUpdates"
import { createClient } from "@/lib/supabase/client"
import { BOARD_STATUS_CONFIG } from "@/lib/content-deck/status-colors"
import type { BoardItem, BoardItemStatus, BoardPlatform, BuyerStage } from "@/lib/content-deck/types"
import type { WorkspaceMember } from "@/lib/hooks/useWorkspaceMembers"

interface TaskDetailPanelProps {
  item: BoardItem | null
  groupName?: string
  groupColor?: string
  allItems: BoardItem[]
  members: WorkspaceMember[]
  onClose: () => void
  onUpdateItem: (id: string, payload: Partial<BoardItem>) => void
  onDelete: (id: string) => void
}

function fmtTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  })
}

function initials(name: string | null | undefined): string {
  if (!name) return "?"
  return name.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase() ?? "").join("")
}

function avatarColor(name: string): string {
  const colors = ["bg-blue-500", "bg-teal-500", "bg-purple-500", "bg-orange-500", "bg-green-500", "bg-red-500"]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}

export function TaskDetailPanel({
  item, groupName, groupColor, allItems, members,
  onClose, onUpdateItem, onDelete,
}: TaskDetailPanelProps) {
  const [title, setTitle] = useState(item?.title ?? "")
  const [body, setBody] = useState(item?.body ?? "")
  const [updateBody, setUpdateBody] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [mention, setMention] = useState<string | null>(null)
  const [mentionQuery, setMentionQuery] = useState("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [attachLink, setAttachLink] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { updates, isLoading: updatesLoading, addUpdate } = useContentUpdates(item?.id ?? null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
      setUserName(data.user?.user_metadata?.full_name ?? data.user?.email ?? null)
    })
  }, [])

  // Sync state when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setBody(item.body ?? "")
    }
  }, [item?.id])

  const debounceSave = useCallback((field: "title" | "body", val: string) => {
    if (!item) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onUpdateItem(item.id, { [field]: val })
    }, 800)
  }, [item, onUpdateItem])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    debounceSave("title", e.target.value)
  }

  const handleBodyChange = (html: string) => {
    setBody(html)
    debounceSave("body", html)
  }

  // @mention detection
  const handleUpdateInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setUpdateBody(val)
    const atIdx = val.lastIndexOf("@")
    if (atIdx !== -1 && atIdx === val.length - 1) {
      setMention("@")
      setMentionQuery("")
    } else if (atIdx !== -1 && !val.slice(atIdx + 1).includes(" ")) {
      setMention("@")
      setMentionQuery(val.slice(atIdx + 1).toLowerCase())
    } else {
      setMention(null)
      setMentionQuery("")
    }
  }

  const insertMention = (member: WorkspaceMember) => {
    const atIdx = updateBody.lastIndexOf("@")
    const before = updateBody.slice(0, atIdx)
    const name = member.full_name ?? "User"
    setUpdateBody(`${before}@${name} `)
    setMention(null)
  }

  const filteredMembers = mention
    ? members.filter(m =>
        (m.full_name?.toLowerCase().includes(mentionQuery) ?? false) ||
        (m.email?.toLowerCase().includes(mentionQuery) ?? false)
      )
    : []

  const submitUpdate = async () => {
    const trimmed = updateBody.trim()
    if (!trimmed || !userId) return
    let finalBody = trimmed
    if (pendingFile) finalBody += `\n[📎 ${pendingFile.name}]`
    if (attachLink.trim()) finalBody += `\n[🔗 ${attachLink.trim()}]`
    setUpdateBody("")
    setPendingFile(null)
    setAttachLink("")
    setShowLinkInput(false)
    await addUpdate(finalBody, userId, userName ?? undefined)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const depItem = item?.dependency_item_id ? allItems.find(i => i.id === item.dependency_item_id) : null

  if (!item) return null

  return (
    <Dialog.Root open={!!item} onOpenChange={v => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[1200px] h-[88vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-shrink-0">
            {groupColor && (
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: groupColor }} />
            )}
            {groupName && (
              <span className="text-xs text-neutral-400 flex-shrink-0">{groupName}</span>
            )}
            <input
              ref={titleRef}
              value={title}
              onChange={handleTitleChange}
              className="flex-1 text-lg font-semibold bg-transparent border-none outline-none min-w-0"
              placeholder="Task title…"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-24">
                <StatusCell value={item.status} onChange={v => onUpdateItem(item.id, { status: v })} />
              </div>
              <Dialog.Close asChild>
                <button className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 min-h-0">
            {/* Left: rich text editor */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-border">
              <TaskEditor
                value={body}
                onChange={handleBodyChange}
                placeholder="Write a description, notes, or any content for this post…"
              />
            </div>

            {/* Right: properties + updates */}
            <div className="w-[320px] flex-shrink-0 flex flex-col overflow-y-auto">
              {/* Properties */}
              <div className="px-4 py-4 space-y-3 border-b border-border">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Properties</p>

                <PropRow label="Owner">
                  <OwnerCell name={item.owner_name} avatar={item.owner_avatar} />
                </PropRow>

                <PropRow label="Platform">
                  <div className="flex-1">
                    <PlatformCell value={item.platform} onChange={v => onUpdateItem(item.id, { platform: v as BoardPlatform | null })} />
                  </div>
                </PropRow>

                <PropRow label="Stage">
                  <div className="flex-1">
                    <BuyerStageCell value={item.buyer_stage} onChange={v => onUpdateItem(item.id, { buyer_stage: v as BuyerStage | null })} />
                  </div>
                </PropRow>

                <PropRow label="Due date">
                  <input
                    type="date"
                    defaultValue={item.due_date ?? ""}
                    onChange={e => onUpdateItem(item.id, { due_date: e.target.value || null })}
                    className="text-xs bg-transparent border-none outline-none text-foreground"
                  />
                </PropRow>

                {item.link_url && (
                  <PropRow label="Link">
                    <a href={item.link_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 truncate max-w-[160px]">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {item.link_url}
                    </a>
                  </PropRow>
                )}

                {depItem && (
                  <PropRow label="Depends on">
                    <span className="text-xs text-neutral-500 truncate max-w-[160px]">{depItem.title}</span>
                  </PropRow>
                )}
              </div>

              {/* Updates section */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Updates</span>
                  {updates.length > 0 && (
                    <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded-full ml-auto">
                      {updates.length}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {updatesLoading ? (
                    <div className="space-y-2 animate-pulse">
                      {[1, 2].map(i => (
                        <div key={i} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded w-20" />
                            <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : updates.length === 0 ? (
                    <p className="text-xs text-neutral-400 text-center py-4">No updates yet.</p>
                  ) : (
                    updates.map(upd => (
                      <div key={upd.id} className="flex gap-2">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0", avatarColor(upd.author_name ?? "?"))}>
                          {initials(upd.author_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-semibold">{upd.author_name ?? "User"}</span>
                            <span className="text-[9px] text-neutral-400">{fmtTime(upd.created_at)}</span>
                          </div>
                          <p className="text-xs text-foreground whitespace-pre-wrap">{upd.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Compose update */}
                <div className="px-4 pb-4 pt-2 border-t border-border space-y-2 flex-shrink-0 relative">
                  {/* @mention suggestions */}
                  {mention && filteredMembers.length > 0 && (
                    <div className="absolute bottom-full left-4 right-4 mb-1 z-10 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                      {filteredMembers.slice(0, 5).map(m => (
                        <button
                          key={m.user_id}
                          onMouseDown={e => { e.preventDefault(); insertMention(m) }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-left"
                        >
                          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0", avatarColor(m.full_name ?? "?"))}>
                            {initials(m.full_name)}
                          </div>
                          <span className="text-xs">{m.full_name ?? m.email ?? "User"}</span>
                          <span className="text-[10px] text-neutral-400 ml-auto capitalize">{m.role}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Pending file indicator */}
                  {pendingFile && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded px-2 py-1">
                      <Paperclip className="w-3 h-3" />
                      <span className="truncate flex-1">{pendingFile.name}</span>
                      <button onClick={() => setPendingFile(null)} className="text-neutral-400 hover:text-foreground">✕</button>
                    </div>
                  )}

                  {/* Link input */}
                  {showLinkInput && (
                    <input
                      value={attachLink}
                      onChange={e => setAttachLink(e.target.value)}
                      placeholder="Paste a URL…"
                      className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background outline-none"
                    />
                  )}

                  <textarea
                    value={updateBody}
                    onChange={handleUpdateInput}
                    onKeyDown={e => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitUpdate()
                      if (e.key === "Escape") { setMention(null) }
                    }}
                    placeholder="Write an update… (@mention)"
                    rows={2}
                    className="w-full resize-none text-xs border border-border rounded-lg px-2.5 py-2 bg-background outline-none focus:ring-2 focus:ring-ring placeholder:text-neutral-400"
                  />

                  <div className="flex items-center gap-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) { if (f.size > 20 * 1024 * 1024) { alert("Max file size is 20MB"); return } setPendingFile(f) }; e.target.value = "" }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded hover:bg-accent text-neutral-400 hover:text-foreground transition-colors"
                      title="Attach file (max 20MB)"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowLinkInput(v => !v)}
                      className="p-1.5 rounded hover:bg-accent text-neutral-400 hover:text-foreground transition-colors"
                      title="Add link"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={submitUpdate}
                      disabled={!updateBody.trim() || !userId}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Update
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400">⌘+Enter to send · @name to mention</p>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 min-h-[28px]">
      <span className="text-xs text-neutral-400 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0 flex items-center">{children}</div>
    </div>
  )
}
