"use client"

import { useState } from "react"
import { Plus, Trash2, Link, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ContentAttachment, CreateAttachmentPayload } from "@/lib/content/types"
import { createAttachment, deleteAttachment } from "@/lib/content/mutations"

interface ContentAttachmentsProps {
  contentItemId: string
  userId: string
  attachments: ContentAttachment[]
  onRefetch: () => void
}

export function ContentAttachments({
  contentItemId,
  userId,
  attachments,
  onRefetch,
}: ContentAttachmentsProps) {
  const [showForm, setShowForm] = useState(false)
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setIsSubmitting(true)
    try {
      const payload: CreateAttachmentPayload = {
        content_item_id: contentItemId,
        external_url: url.trim(),
        file_name: name.trim() || url.trim(),
        created_by: userId,
      }
      await createAttachment(payload)
      setUrl("")
      setName("")
      setShowForm(false)
      onRefetch()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAttachment(id)
      onRefetch()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-3">
      {attachments.length === 0 && !showForm ? (
        <p className="text-sm text-neutral-400 text-center py-4">No attachments yet.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card group">
              <Link className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span className="text-sm flex-1 truncate">{a.file_name ?? a.external_url}</span>
              {a.external_url && (
                <a
                  href={a.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              )}
              <button
                onClick={() => handleDelete(a.id)}
                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3 text-neutral-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleAdd} className="space-y-2 p-3 border border-border rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
          <div className="space-y-1">
            <Label htmlFor="att-url" className="text-xs">URL</Label>
            <Input
              id="att-url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="att-name" className="text-xs">Name (optional)</Label>
            <Input
              id="att-name"
              placeholder="Brief file name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="h-7 text-xs" disabled={isSubmitting || !url.trim()}>
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
            <Button
              type="button" variant="outline" size="sm" className="h-7 text-xs"
              onClick={() => { setShowForm(false); setUrl(""); setName("") }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="w-full border-dashed text-neutral-500"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add link
        </Button>
      )}
    </div>
  )
}
