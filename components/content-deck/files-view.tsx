"use client"

import { File, Image, FileText, Link2, Upload } from "lucide-react"
import type { BoardItem } from "@/lib/content-deck/types"

interface FilesViewProps {
  items: BoardItem[]
}

function FileTypeIcon({ type }: { type: string | null }) {
  if (!type) return <File className="w-8 h-8 text-neutral-400" />
  if (type.startsWith("image/")) return <Image className="w-8 h-8 text-blue-400" />
  if (type.includes("pdf") || type.includes("document") || type.includes("text"))
    return <FileText className="w-8 h-8 text-red-400" />
  return <File className="w-8 h-8 text-neutral-400" />
}

export function FilesView({ items }: FilesViewProps) {
  // Collect items with links or file counts
  const itemsWithFiles = items.filter(i => i.files_count && i.files_count > 0)
  const itemsWithLinks = items.filter(i => i.link_url)

  const isEmpty = itemsWithFiles.length === 0 && itemsWithLinks.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Upload className="w-10 h-10 text-neutral-300 mb-3" />
        <p className="text-sm text-neutral-500 font-medium">No files yet</p>
        <p className="text-xs text-neutral-400 mt-1">
          Files attached to items or updates will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {itemsWithLinks.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Links
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {itemsWithLinks.map(item => (
              <a
                key={item.id}
                href={item.link_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Link2 className="w-5 h-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate text-foreground group-hover:text-blue-500 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">{item.link_url}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {itemsWithFiles.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Attachments
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {itemsWithFiles.map(item => (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                  <FileTypeIcon type={null} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate text-foreground">{item.title}</p>
                  <p className="text-[10px] text-neutral-400">
                    {item.files_count} {item.files_count === 1 ? "file" : "files"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
