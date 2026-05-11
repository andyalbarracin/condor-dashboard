"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Calendar, ExternalLink, Save, Sparkles, BarChart3, Tag, Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentStatusBadge } from "./content-status-badge"
import { ContentComments } from "./content-comments"
import { ContentActivityLog } from "./content-activity-log"
import { ContentVersionEditor } from "./content-version-editor"
import { ContentAttachments } from "./content-attachments"
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
import type {
  ContentItem,
  ContentVersion,
  ContentComment,
  ContentActivity,
  ContentAttachment,
} from "@/lib/content/types"

interface ContentItemDetailProps {
  item: ContentItem
  versions: ContentVersion[]
  comments: ContentComment[]
  activity: ContentActivity[]
  attachments: ContentAttachment[]
  userId: string
  onRefetch: () => void
}

export function ContentItemDetail({
  item,
  versions,
  comments,
  activity,
  attachments,
  userId,
  onRefetch,
}: ContentItemDetailProps) {
  const router = useRouter()

  // Editable fields
  const [title, setTitle] = useState(item.title)
  const [status, setStatus] = useState<ContentStatus>(item.status)
  const [platform, setPlatform] = useState<ContentPlatform | "">(item.primary_platform ?? "")
  const [contentType, setContentType] = useState<ContentType | "">(item.content_type ?? "")
  const [campaign, setCampaign] = useState(item.campaign ?? "")
  const [dueDate, setDueDate] = useState(item.due_date ?? "")
  const [scheduledAt, setScheduledAt] = useState(item.scheduled_at ? item.scheduled_at.slice(0, 16) : "")
  const [publishedAt, setPublishedAt] = useState(item.published_at ? item.published_at.slice(0, 16) : "")
  const [externalUrl, setExternalUrl] = useState(item.external_url ?? "")

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

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
          published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
          external_url: externalUrl.trim() || null,
        },
        userId,
        item
      )
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
      onRefetch()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border flex items-center justify-between px-6 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {saveError && <span className="text-xs text-red-500">{saveError}</span>}
          {saveSuccess && <span className="text-xs text-green-500">Saved</span>}
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: main content ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-neutral-300 focus:ring-0"
                placeholder="Content title..."
              />
            </div>

            {/* Status + quick meta */}
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                <SelectTrigger className="h-auto border-none bg-transparent p-0 shadow-none focus:ring-0 w-auto">
                  <ContentStatusBadge status={status} />
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

              {platform && (
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {PLATFORM_CONFIG[platform as ContentPlatform]?.label}
                </span>
              )}
              {campaign && (
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {campaign}
                </span>
              )}
            </div>

            <Separator />

            {/* Tabs: Versions, Comments, Activity, Attachments */}
            <Tabs defaultValue="versions">
              <TabsList className="w-full justify-start bg-transparent p-0 h-auto border-b border-border rounded-none gap-0">
                {[
                  { value: "versions", label: "Versions" },
                  { value: "comments", label: `Comments (${comments.length})` },
                  { value: "activity", label: "Activity" },
                  { value: "attachments", label: `Files (${attachments.length})` },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="versions" className="mt-4">
                <ContentVersionEditor
                  contentItemId={item.id}
                  userId={userId}
                  versions={versions}
                  onRefetch={onRefetch}
                />
              </TabsContent>

              <TabsContent value="comments" className="mt-4">
                <ContentComments
                  contentItemId={item.id}
                  userId={userId}
                  comments={comments}
                  onRefetch={onRefetch}
                />
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <ContentActivityLog activity={activity} />
              </TabsContent>

              <TabsContent value="attachments" className="mt-4">
                <ContentAttachments
                  contentItemId={item.id}
                  userId={userId}
                  attachments={attachments}
                  onRefetch={onRefetch}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Right column: metadata ── */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Details</p>

              {/* Platform */}
              <div className="space-y-1">
                <Label className="text-xs text-neutral-500">Platform</Label>
                <Select value={platform || "none"} onValueChange={(v) => setPlatform(v === "none" ? "" : v as ContentPlatform)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {CONTENT_PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{PLATFORM_CONFIG[p].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content type */}
              <div className="space-y-1">
                <Label className="text-xs text-neutral-500">Content Type</Label>
                <Select value={contentType || "none"} onValueChange={(v) => setContentType(v === "none" ? "" : v as ContentType)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {CONTENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campaign */}
              <div className="space-y-1">
                <Label className="text-xs text-neutral-500">Campaign</Label>
                <Input
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="Campaign name..."
                  className="h-8 text-sm"
                />
              </div>

              <Separator />

              {/* Due date */}
              <div className="space-y-1">
                <Label className="text-xs text-neutral-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Due date
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* Scheduled */}
              <div className="space-y-1">
                <Label className="text-xs text-neutral-500">Scheduled</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* Published */}
              <div className="space-y-1">
                <Label className="text-xs text-neutral-500">Published</Label>
                <Input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              <Separator />

              {/* External URL */}
              <div className="space-y-1">
                <Label className="text-xs text-neutral-500 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Published URL
                </Label>
                <Input
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Performance placeholder */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-neutral-400" />
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Performance</p>
              </div>
              <p className="text-xs text-neutral-400">
                Link this item to a published post to see performance data.
              </p>
              {item.external_url && (
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View published post
                </a>
              )}
            </div>

            {/* AI placeholder */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-neutral-400" />
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">AI Suggestions</p>
              </div>
              <p className="text-xs text-neutral-400">
                AI-powered content suggestions coming in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
