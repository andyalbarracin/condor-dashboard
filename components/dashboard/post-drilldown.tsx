"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface PostDrilldownProps {
  open: boolean
  post: any
  onClose: () => void
}

export function PostDrilldown({ open, post, onClose }: PostDrilldownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, onClose])

  if (!open || !post) return null

  return (
    <div className="fixed inset-0 z-50 flex" style={{ pointerEvents: open ? "auto" : "none" }}>
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <aside
        ref={ref}
        className="w-full max-w-md h-full bg-neutral-900 border-l border-neutral-700 flex flex-col shadow-2xl transform transition-transform"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="p-6 border-b border-neutral-700 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase">{post?.source || "Post"}</p>
            <h3 className="text-lg font-bold text-foreground mt-1">{post?.metrics?.title || "(No title)"}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {post?.metrics?.content && (
            <div>
              <p className="text-sm text-neutral-400 leading-relaxed">{post.metrics.content}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Views", value: post?.metrics?.views },
              { label: "Likes", value: post?.metrics?.likes },
              { label: "Comments", value: post?.metrics?.comments },
              { label: "Shares", value: post?.metrics?.shares },
              { label: "Clicks", value: post?.metrics?.clicks },
              { label: "Engagements", value: post?.metrics?.engagements },
            ].map(
              (item) =>
                item.value != null && (
                  <div key={item.label} className="bg-neutral-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{item.value}</p>
                    <p className="text-xs text-neutral-500 mt-1">{item.label}</p>
                  </div>
                ),
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
