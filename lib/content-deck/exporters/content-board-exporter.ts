import * as XLSX from "xlsx"
import type { ContentBoard, ContentGroup, BoardItem } from "../types"
import { BOARD_STATUS_CONFIG, BOARD_PLATFORM_CONFIG, BUYER_STAGE_CONFIG } from "../status-colors"

interface ExportOptions {
  format?: "xlsx" | "csv"
  filename?: string
}

function fmt(date: string | null): string {
  if (!date) return ""
  try {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return date
  }
}

function statusLabel(s: BoardItem["status"]): string {
  return BOARD_STATUS_CONFIG[s]?.label ?? s
}

function platformLabel(p: BoardItem["platform"]): string {
  if (!p) return ""
  return BOARD_PLATFORM_CONFIG[p]?.label ?? p
}

function stageLabel(s: BoardItem["buyer_stage"]): string {
  if (!s) return ""
  return BUYER_STAGE_CONFIG[s]?.label ?? s
}

export function exportContentBoard(
  board: ContentBoard,
  groups: ContentGroup[],
  items: BoardItem[],
  options: ExportOptions = {}
): void {
  const { format = "xlsx", filename } = options
  const name = filename ?? `${board.name.replace(/[^a-z0-9]/gi, "_")}_export`

  const rows: (string | number)[][] = []

  // Header row
  rows.push([
    "Group", "Task", "Owner", "Status", "Platform",
    "Buyer Stage", "Date", "Link", "Dependent on",
    "Updates", "Files",
  ])

  for (const group of groups) {
    const groupItems = items.filter(i => i.group_id === group.id)
    for (const item of groupItems) {
      const depItem = item.dependency_item_id
        ? items.find(i => i.id === item.dependency_item_id)
        : null
      rows.push([
        group.name,
        item.title,
        item.owner_name ?? "",
        statusLabel(item.status),
        platformLabel(item.platform),
        stageLabel(item.buyer_stage),
        fmt(item.due_date),
        item.link_url ?? "",
        depItem?.title ?? "",
        item.updates_count ?? 0,
        item.files_count ?? 0,
      ])
    }
  }

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Column widths
  ws["!cols"] = [
    { wch: 25 }, // Group
    { wch: 45 }, // Task
    { wch: 20 }, // Owner
    { wch: 14 }, // Status
    { wch: 15 }, // Platform
    { wch: 15 }, // Buyer Stage
    { wch: 14 }, // Date
    { wch: 35 }, // Link
    { wch: 35 }, // Dependent on
    { wch: 9 },  // Updates
    { wch: 7 },  // Files
  ]

  XLSX.utils.book_append_sheet(wb, ws, board.name.slice(0, 31))

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    downloadBlob(blob, `${name}.csv`)
  } else {
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([buf], { type: "application/octet-stream" })
    downloadBlob(blob, `${name}.xlsx`)
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
