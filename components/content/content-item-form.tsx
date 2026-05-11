"use client"

import { useState } from "react"
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
import type { CreateContentItemPayload } from "@/lib/content/types"

interface ContentItemFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: CreateContentItemPayload) => Promise<void>
  workspaceId: string
  userId: string
  defaultStatus?: ContentStatus
}

export function ContentItemForm({
  open,
  onClose,
  onSubmit,
  workspaceId,
  userId,
  defaultStatus = "idea",
}: ContentItemFormProps) {
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<ContentStatus>(defaultStatus)
  const [platform, setPlatform] = useState<ContentPlatform | "">("")
  const [contentType, setContentType] = useState<ContentType | "">("")
  const [campaign, setCampaign] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setTitle("")
    setStatus(defaultStatus)
    setPlatform("")
    setContentType("")
    setCampaign("")
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required"); return }

    setIsLoading(true)
    setError(null)

    try {
      await onSubmit({
        workspace_id: workspaceId,
        title: title.trim(),
        status,
        primary_platform: platform || null,
        platforms: platform ? [platform as ContentPlatform] : [],
        content_type: (contentType as ContentType) || null,
        campaign: campaign.trim() || null,
        created_by: userId,
        author_id: userId,
      })
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New Content Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              placeholder="e.g. Why B2B companies fail at LinkedIn"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Status */}
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

            {/* Platform */}
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as ContentPlatform)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PLATFORM_CONFIG[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campaign */}
            <div className="space-y-1.5">
              <Label htmlFor="campaign">Campaign</Label>
              <Input
                id="campaign"
                placeholder="Optional"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
