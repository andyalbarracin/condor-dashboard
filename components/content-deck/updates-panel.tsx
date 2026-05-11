"use client"

import { useEffect, useRef, useState } from "react"
import { X, Send, MessageSquare, Clock, Paperclip, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useContentUpdates } from "@/lib/hooks/useContentUpdates"
import type { BoardItem } from "@/lib/content-deck/types"
import type { WorkspaceMember } from "@/lib/hooks/useWorkspaceMembers"

interface UpdatesPanelProps {
  item: BoardItem | null
  onClose: () => void
  members?: WorkspaceMember[]
}

function fmtTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
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

export function UpdatesPanel({ item, onClose, members = [] }: UpdatesPanelProps) {
  const { updates, isLoading, addUpdate } = useContentUpdates(item?.id ?? null)
  const [body, setBody] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [attachLink, setAttachLink] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
      setUserName(data.user?.user_metadata?.full_name ?? data.user?.email ?? null)
    })
  }, [])

  useEffect(() => {
    if (item) {
      setBody("")
      setPendingFile(null)
      setAttachLink("")
      setShowLinkInput(false)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [item?.id])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setBody(val)
    const atIdx = val.lastIndexOf("@")
    if (atIdx !== -1 && !val.slice(atIdx + 1).includes(" ")) {
      setMentionQuery(val.slice(atIdx + 1).toLowerCase())
    } else {
      setMentionQuery(null)
    }
  }

  const insertMention = (member: WorkspaceMember) => {
    const atIdx = body.lastIndexOf("@")
    const newBody = body.slice(0, atIdx) + `@${member.full_name ?? "User"} `
    setBody(newBody)
    setMentionQuery(null)
    textareaRef.current?.focus()
  }

  const filteredMembers = mentionQuery !== null
    ? members.filter(m =>
        (m.full_name?.toLowerCase().includes(mentionQuery) ?? false) ||
        (m.email?.toLowerCase().includes(mentionQuery) ?? false)
      ).slice(0, 5)
    : []

  const submit = async () => {
    const trimmed = body.trim()
    if (!trimmed || !userId) return
    let finalBody = trimmed
    if (pendingFile) finalBody += `\n[📎 ${pendingFile.name}]`
    if (attachLink.trim()) finalBody += `\n[🔗 ${attachLink.trim()}]`
    setBody("")
    setPendingFile(null)
    setAttachLink("")
    setShowLinkInput(false)
    await addUpdate(finalBody, userId, userName ?? undefined)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  if (!item) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 w-[440px] max-w-full bg-background border-l border-border shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <h2 className="text-sm font-semibold truncate">{item.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata */}
        <div className="px-5 py-3 border-b border-border bg-neutral-50/50 dark:bg-neutral-900/30 flex-shrink-0">
          <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
            {item.platform && (
              <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded capitalize">{item.platform.replace(/_/g, " ")}</span>
            )}
            {item.buyer_stage && (
              <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded capitalize">{item.buyer_stage}</span>
            )}
            {item.due_date && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                <Clock className="w-3 h-3" />
                {new Date(item.due_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
            <span className="px-2 py-0.5 rounded capitalize bg-accent">
              {item.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Updates list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : updates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare className="w-8 h-8 text-neutral-300 mb-2" />
              <p className="text-sm text-neutral-400">No updates yet.</p>
              <p className="text-xs text-neutral-300 mt-1">Be the first to write an update.</p>
            </div>
          ) : (
            updates.map(upd => (
              <div key={upd.id} className="flex gap-3">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0", avatarColor(upd.author_name ?? "?"))}>
                  {initials(upd.author_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold">{upd.author_name ?? "User"}</span>
                    <span className="text-[10px] text-neutral-400">{fmtTime(upd.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{upd.body}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0 space-y-2 relative">
          {/* @mention suggestions */}
          {filteredMembers.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-1 z-10 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
              {filteredMembers.map(m => (
                <button
                  key={m.user_id}
                  onMouseDown={e => { e.preventDefault(); insertMention(m) }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-left"
                >
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold", avatarColor(m.full_name ?? "?"))}>
                    {initials(m.full_name)}
                  </div>
                  <span className="text-xs">{m.full_name ?? m.email ?? "User"}</span>
                  <span className="text-[10px] text-neutral-400 ml-auto capitalize">{m.role}</span>
                </button>
              ))}
            </div>
          )}

          {/* Pending file */}
          {pendingFile && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded px-2 py-1">
              <Paperclip className="w-3 h-3 flex-shrink-0" />
              <span className="truncate flex-1">{pendingFile.name}</span>
              <button onClick={() => setPendingFile(null)} className="text-neutral-400 hover:text-foreground flex-shrink-0">✕</button>
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

          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={body}
              onChange={handleInput}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit()
                if (e.key === "Escape") setMentionQuery(null)
              }}
              placeholder="Write an update… (type @ to mention)"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={submit}
              disabled={!body.trim() || !userId}
              className="self-end px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) {
                  if (f.size > 20 * 1024 * 1024) { alert("Max file size is 20MB"); return }
                  setPendingFile(f)
                }
                e.target.value = ""
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
              title="Attach file (max 20MB)"
            >
              <Paperclip className="w-3.5 h-3.5" />
              File
            </button>
            <button
              onClick={() => setShowLinkInput(v => !v)}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
            >
              <Link2 className="w-3.5 h-3.5" />
              Link
            </button>
            <span className="text-[10px] text-neutral-400 ml-auto">⌘+Enter to send</span>
          </div>
        </div>
      </div>
    </>
  )
}
