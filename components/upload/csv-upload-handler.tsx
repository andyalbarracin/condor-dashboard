"use client"

import { useState } from "react"
import { parseCSV } from "@/lib/parsers/csv-parser"
import type { ParsedDataset } from "@/lib/parsers/types"

interface CSVUploadHandlerProps {
  onSuccess: (data: ParsedDataset) => void
  onError: (error: string) => void
}

export function CSVUploadHandler({ onSuccess, onError }: CSVUploadHandlerProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleFileUpload(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      onError("Please upload a CSV file")
      return
    }

    setIsLoading(true)

    try {
      const text = await file.text()
      const result = await parseCSV(text)

      if (!result.success || !result.data) {
        onError(result.error || "Failed to parse CSV")
        return
      }

      onSuccess(result.data)
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to upload file")
    } finally {
      setIsLoading(false)
    }
  }

  return { handleFileUpload, isLoading }
}
