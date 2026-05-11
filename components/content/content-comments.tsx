"use client"

import { useState } from "react"
import { Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createComment, deleteComment } from "@/lib/content/mutations"
import type { ContentComment, CreateCommentPayload } from "@/lib/content/types"

interface ContentCommentsProps {
  contentItemId: string
  userId: string
  comments: ContentComment[]
  onRefetch: () => void
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

function AvatarPlaceholder({ name }: { name: string | null }) {
  const initials = name
    ? name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
    : "?"
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

export function ContentComments({ contentItemId, userId, comments, onRefetch }: ContentCommentsProps) {
  const [body, setBody] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!body.trim()) return
    setIsSubmitting(true)
    try {
      const payload: CreateCommentPayload = {
        content_item_id: contentItemId,
        user_id: userId,
        body: body.trim(),
      }
      await createComment(payload)
      setBody("")
      onRefetch()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id)
      onRefetch()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-4">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5 group">
              <AvatarPlaceholder name={comment.profile?.full_name ?? null} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {comment.profile?.full_name ?? "User"}
                  </span>
                  <span className="text-[10px] text-neutral-400">{formatTime(comment.created_at)}</span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5 break-words">
                  {comment.body}
                </p>
              </div>
              {comment.user_id === userId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3 text-neutral-400 hover:text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New comment input */}
      <div className="flex gap-2.5 pt-2 border-t border-border">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">Y</span>
        </div>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !body.trim()}
              className="h-7 text-xs"
            >
              <Send className="w-3 h-3 mr-1" />
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
