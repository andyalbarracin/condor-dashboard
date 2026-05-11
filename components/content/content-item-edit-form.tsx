"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  CONTENT_STATUSES,
  CONTENT_PLATFORMS,
  CONTENT_TYPES,
  STATUS_CONFIG,
  PLATFORM_CONFIG,
  type ContentStatus,
  type ContentPlatform,
  type ContentType,
} from "@/lib/content/types"
import { updateContentItem } from "@/lib/content/mutations"
import type { ContentItem } from "@/lib/content/types"

interface ContentItemEditFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  item: ContentItem
  userId?: string | null
}

export function ContentItemEditForm({
  open,
  onClose,
  onSuccess,
  item,
  userId,
}: ContentItemEditFormProps) {
  const [title, setTitle] = useState(item.title)
  const [status, setStatus] = useState<ContentStatus>(item.status)
  const [platform, setPlatform] = useState<ContentPlatform | "">(item.primary_platform ?? "")
  const [contentType, setContentType] = useState<ContentType | "">(item.content_type ?? "")
  const [campaign, setCampaign] = useState(item.campaign ?? "")
  const [dueDate, setDueDate] = useState(item.due_date ?? "")
  const [scheduledAt, setScheduledAt] = useState(
    item.scheduled_at ? item.scheduled_at.slice(0, 16) : ""
  )
  const [externalUrl, setExternalUrl] = useState(item.external_url ?? "")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync fields when item changes (e.g. different card edited)
  useEffect(() => {
    setTitle(item.title)
    setStatus(item.status)
    setPlatform(item.primary_platform ?? "")
    setContentType(item.content_type ?? "")
    setCampaign(item.campaign ?? "")
    setDueDate(item.due_date ?? "")
    setScheduledAt(item.scheduled_at ? item.scheduled_at.slice(0, 16) : "")
    setExternalUrl(item.external_url ?? "")
    setError(null)
  }, [item.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required"); return }
    setIsLoading(true)
    setError(null)
    try {
      await updateContentItem(
        item.id,
        {
          title: title.trim(),
          status,
          primary_platform: (platform as ContentPlatform) || null,
          platforms: platform ? [platform as ContentPlatform] : [],
          content_type: (contentType as ContentType) || null,
          campaign: campaign.trim() || null,
          due_date: dueDate || null,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          external_url: externalUrl.trim() || null,
        },
        userId,
        item
      )
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Content Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Status + Platform */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                        {STATUS_CONFIG[s].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={platform || "none"} onValueChange={(v) => setPlatform(v === "none" ? "" : v as ContentPlatform)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {CONTENT_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{PLATFORM_CONFIG[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Type + Campaign */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Content Type</Label>
              <Select value={contentType || "none"} onValueChange={(v) => setContentType(v === "none" ? "" : v as ContentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-campaign">Campaign</Label>
              <Input
                id="edit-campaign"
                placeholder="Optional"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-due">Due Date</Label>
              <Input
                id="edit-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-sched">Scheduled</Label>
              <Input
                id="edit-sched"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          </div>

          {/* External URL */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-url">Published URL</Label>
            <Input
              id="edit-url"
              placeholder="https://..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
