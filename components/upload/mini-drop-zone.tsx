"use client"

import type React from "react"
import { useState, useRef } from "react"
import { FileUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MiniDropZoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
}

export function MiniDropZone({ onFileSelect, isLoading }: MiniDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0])
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-3 text-center cursor-pointer h-full flex flex-col items-center justify-center",
        "transition-all duration-300",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card-hover",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls"
        className="hidden"
        disabled={isLoading}
      />

      <div className="flex flex-col items-center gap-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-xs">Drop your CSV here</p>
          <p className="text-xs text-neutral-500 mt-0.5">or click to browse (CSV, XLSX)</p>
        </div>
        {isLoading && <p className="text-xs text-primary animate-pulse">Processing...</p>}
      </div>
    </div>
  )
}
