"use client"

import { useState } from "react"
import { Plus, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { CONTENT_PLATFORMS, PLATFORM_CONFIG, type ContentPlatform } from "@/lib/content/types"
import type { ContentVersion, CreateContentVersionPayload } from "@/lib/content/types"
import { createContentVersion, deleteContentVersion } from "@/lib/content/mutations"

interface ContentVersionEditorProps {
  contentItemId: string
  userId: string
  versions: ContentVersion[]
  onRefetch: () => void
}

function VersionCard({
  version,
  onDelete,
}: {
  version: ContentVersion
  onDelete: (id: string) => void
}) {
  const cfg = PLATFORM_CONFIG[version.platform]
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded border"
            style={{ color: cfg.color, borderColor: `${cfg.color}30`, backgroundColor: `${cfg.color}10` }}
          >
            {cfg.label}
          </span>
          {version.is_primary && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
              <Star className="w-2.5 h-2.5 fill-current" /> Primary
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete(version.id)}
          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
        </button>
      </div>

      {version.headline && (
        <p className="text-sm font-medium">{version.headline}</p>
      )}
      {version.body && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap line-clamp-4">
          {version.body}
        </p>
      )}
      {version.cta && (
        <p className="text-xs text-primary font-medium">CTA: {version.cta}</p>
      )}
      {version.hashtags && version.hashtags.length > 0 && (
        <p className="text-xs text-neutral-400">{version.hashtags.map(h => `#${h}`).join(" ")}</p>
      )}
    </div>
  )
}

export function ContentVersionEditor({
  contentItemId,
  userId,
  versions,
  onRefetch,
}: ContentVersionEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [platform, setPlatform] = useState<ContentPlatform>("linkedin")
  const [headline, setHeadline] = useState("")
  const [body, setBody] = useState("")
  const [cta, setCta] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [notes, setNotes] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setPlatform("linkedin")
    setHeadline("")
    setBody("")
    setCta("")
    setHashtags("")
    setNotes("")
    setIsPrimary(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() && !headline.trim()) {
      setError("At least headline or body is required")
      return
    }
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: CreateContentVersionPayload = {
        content_item_id: contentItemId,
        platform,
        headline: headline.trim() || null,
        body: body.trim() || null,
        cta: cta.trim() || null,
        hashtags: hashtags.trim()
          ? hashtags.split(/[\s,#]+/).filter(Boolean)
          : [],
        notes: notes.trim() || null,
        is_primary: isPrimary,
        created_by: userId,
      }
      await createContentVersion(payload)
      resetForm()
      setShowForm(false)
      onRefetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save version")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteContentVersion(id)
      onRefetch()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing versions */}
      {versions.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-4">
          No platform versions yet. Add versions for each platform you plan to publish on.
        </p>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <VersionCard key={v.id} version={v} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add version button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowForm(true)}
        className="w-full border-dashed text-neutral-500"
      >
        <Plus className="w-3.5 h-3.5 mr-1.5" />
        Add platform version
      </Button>

      {/* New version dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { resetForm(); setShowForm(false) } }}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Content Version</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as ContentPlatform)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{PLATFORM_CONFIG[p].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="v-headline">Headline</Label>
                <Input
                  id="v-headline"
                  placeholder="Post headline..."
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-body">Body</Label>
              <Textarea
                id="v-body"
                placeholder="Main content..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="v-cta">CTA</Label>
                <Input
                  id="v-cta"
                  placeholder="Call to action..."
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="v-hashtags">Hashtags</Label>
                <Input
                  id="v-hashtags"
                  placeholder="b2b marketing linkedin..."
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-notes">Notes</Label>
              <Input
                id="v-notes"
                placeholder="Internal notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Mark as primary version</span>
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { resetForm(); setShowForm(false) }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save version"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
