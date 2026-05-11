"use client"

import { useState, useRef } from "react"
import { Plus } from "lucide-react"

interface AddItemRowProps {
  onAdd: (title: string) => void
  accentColor: string
}

export function AddItemRow({ onAdd, accentColor }: AddItemRowProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const start = () => {
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const commit = () => {
    const trimmed = value.trim()
    if (trimmed) onAdd(trimmed)
    setValue("")
    setEditing(false)
  }

  const cancel = () => {
    setValue("")
    setEditing(false)
  }

  return (
    <div className="flex items-center border-b border-border last:border-0 group min-h-[36px]">
      {/* Accent bar */}
      <div className="w-1 self-stretch flex-shrink-0" style={{ backgroundColor: accentColor }} />

      {/* Checkbox placeholder */}
      <div className="w-9 flex-shrink-0" />

      {/* Add task trigger / inline input */}
      <div className="flex-1 min-w-0 px-3 py-1.5">
        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") commit()
              if (e.key === "Escape") cancel()
            }}
            onBlur={commit}
            className="w-full text-sm bg-transparent border-none outline-none placeholder:text-neutral-400"
            placeholder="Type a task name..."
          />
        ) : (
          <button
            onClick={start}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add task
          </button>
        )}
      </div>
    </div>
  )
}
