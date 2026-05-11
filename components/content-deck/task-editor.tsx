"use client"

import { useRef, useEffect, useCallback } from "react"
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  Code, Quote, List, ListOrdered, ImageIcon, Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  readOnly?: boolean
  onImageUpload?: (file: File) => Promise<string>
}

const TOOLBAR_GROUPS = [
  [
    { icon: Heading1, title: "Heading 1", cmd: "h1" },
    { icon: Heading2, title: "Heading 2", cmd: "h2" },
    { icon: Heading3, title: "Heading 3", cmd: "h3" },
  ],
  [
    { icon: Bold,   title: "Bold (⌘B)",   cmd: "bold" },
    { icon: Italic, title: "Italic (⌘I)", cmd: "italic" },
  ],
  [
    { icon: Code,  title: "Code block",  cmd: "pre" },
    { icon: Quote, title: "Blockquote",  cmd: "blockquote" },
    { icon: Minus, title: "Divider",     cmd: "hr" },
  ],
  [
    { icon: List,         title: "Bullet list",   cmd: "ul" },
    { icon: ListOrdered,  title: "Numbered list", cmd: "ol" },
  ],
]

export function TaskEditor({ value, onChange, placeholder, readOnly, onImageUpload }: TaskEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  // Populate editor on mount only
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync when value changes externally (e.g. loading a different item)
  const lastItemValue = useRef(value)
  useEffect(() => {
    if (lastItemValue.current !== value && editorRef.current && !isInternalChange.current) {
      editorRef.current.innerHTML = value || ""
      lastItemValue.current = value
    }
  }, [value])

  const emit = useCallback(() => {
    if (!editorRef.current) return
    isInternalChange.current = true
    onChange(editorRef.current.innerHTML)
    lastItemValue.current = editorRef.current.innerHTML
    setTimeout(() => { isInternalChange.current = false }, 0)
  }, [onChange])

  const exec = useCallback((cmd: string) => {
    const editor = editorRef.current
    if (!editor) return

    if (cmd === "bold")   { document.execCommand("bold");   return emit() }
    if (cmd === "italic") { document.execCommand("italic"); return emit() }

    if (cmd === "h1" || cmd === "h2" || cmd === "h3") {
      document.execCommand("formatBlock", false, cmd)
      return emit()
    }

    if (cmd === "blockquote") {
      document.execCommand("formatBlock", false, "blockquote")
      return emit()
    }

    if (cmd === "ul") {
      document.execCommand("insertUnorderedList")
      return emit()
    }

    if (cmd === "ol") {
      document.execCommand("insertOrderedList")
      return emit()
    }

    if (cmd === "pre") {
      const sel = window.getSelection()
      if (!sel?.rangeCount) return
      const range = sel.getRangeAt(0)
      const pre = document.createElement("pre")
      const code = document.createElement("code")
      code.textContent = sel.toString() || "// code here"
      pre.appendChild(code)
      range.deleteContents()
      range.insertNode(pre)
      // move cursor after the block
      const after = document.createTextNode("​")
      pre.after(after)
      sel.collapse(after, 1)
      return emit()
    }

    if (cmd === "hr") {
      document.execCommand("insertHorizontalRule")
      return emit()
    }

    editor.focus()
  }, [emit])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key === "b") { e.preventDefault(); exec("bold") }
    if (mod && e.key === "i") { e.preventDefault(); exec("italic") }
  }, [exec])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    // Handle image paste
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue

        if (onImageUpload) {
          onImageUpload(file).then(url => {
            document.execCommand("insertImage", false, url)
            emit()
          })
        } else {
          // Fallback: base64 inline
          const reader = new FileReader()
          reader.onload = () => {
            document.execCommand("insertImage", false, reader.result as string)
            emit()
          }
          reader.readAsDataURL(file)
        }
        return
      }
    }
  }, [emit, onImageUpload])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    if (onImageUpload) {
      onImageUpload(file).then(url => {
        document.execCommand("insertImage", false, url)
        emit()
      })
    } else {
      const reader = new FileReader()
      reader.onload = () => {
        editorRef.current?.focus()
        document.execCommand("insertImage", false, reader.result as string)
        emit()
      }
      reader.readAsDataURL(file)
    }
  }, [emit, onImageUpload])

  const imgInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border flex-wrap flex-shrink-0">
          {TOOLBAR_GROUPS.map((group, gi) => (
            <div key={gi} className="flex items-center gap-0.5 mr-1">
              {group.map(({ icon: Icon, title, cmd }) => (
                <button
                  key={cmd}
                  title={title}
                  onMouseDown={e => {
                    e.preventDefault() // prevent editor from losing focus
                    exec(cmd)
                  }}
                  className="p-1.5 rounded hover:bg-accent text-neutral-500 hover:text-foreground transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
              {gi < TOOLBAR_GROUPS.length - 1 && (
                <div className="w-px h-4 bg-border mx-1" />
              )}
            </div>
          ))}

          {/* Image upload */}
          <div className="flex items-center gap-0.5">
            <div className="w-px h-4 bg-border mr-1" />
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button
              title="Insert image"
              onMouseDown={e => { e.preventDefault(); imgInputRef.current?.click() }}
              className="p-1.5 rounded hover:bg-accent text-neutral-500 hover:text-foreground transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Editor surface */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={emit}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder ?? "Write something…"}
        className={cn(
          "flex-1 overflow-y-auto px-4 py-3 outline-none min-h-[200px] text-sm leading-relaxed",
          "focus:ring-0",
          // Prose-like styles via arbitrary Tailwind selectors
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:leading-tight",
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3",
          "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-2",
          "[&_p]:mb-2 [&_p]:leading-relaxed",
          "[&_pre]:bg-neutral-100 [&_pre]:dark:bg-neutral-800 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:my-2 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:overflow-x-auto",
          "[&_code]:bg-neutral-100 [&_code]:dark:bg-neutral-800 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
          "[&_blockquote]:border-l-[3px] [&_blockquote]:border-neutral-300 [&_blockquote]:dark:border-neutral-600 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-500 [&_blockquote]:my-2",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
          "[&_li]:mb-0.5",
          "[&_hr]:my-4 [&_hr]:border-border",
          "[&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2",
          "[&_strong]:font-bold",
          "[&_em]:italic",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400",
          !readOnly && "cursor-text"
        )}
      />
    </div>
  )
}
