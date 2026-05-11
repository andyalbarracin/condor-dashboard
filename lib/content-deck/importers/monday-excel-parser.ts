import * as XLSX from "xlsx"
import type { BoardItemStatus, BoardPlatform, BuyerStage } from "../types"

export interface ParsedBoardGroup {
  name: string
  items: ParsedBoardItem[]
}

export interface ParsedBoardItem {
  title: string
  owner_name: string | null
  status: BoardItemStatus
  platform: BoardPlatform | null
  buyer_stage: BuyerStage | null
  due_date: string | null
  link_url: string | null
  dependency_title: string | null
}

export interface MondayParseResult {
  board_name: string
  groups: ParsedBoardGroup[]
  raw_columns: string[]
  warnings: string[]
}

// Map monday status labels → our statuses
const STATUS_MAP: Record<string, BoardItemStatus> = {
  "idea only":   "idea_only",
  "not started": "not_started",
  "in progress": "in_progress",
  "in review":   "in_review",
  "dependent":   "dependent",
  "approved":    "approved",
  "scheduled":   "scheduled",
  "published":   "published",
  "done":        "done",
  "blocked":     "blocked",
  "working on it": "in_progress",
  "stuck":       "blocked",
  "":            "not_started",
}

// Map platform labels
const PLATFORM_MAP: Record<string, BoardPlatform> = {
  "social media": "social_media",
  "social":       "social_media",
  "blog":         "blog",
  "email":        "email",
  "video":        "video",
  "landing page": "landing_page",
  "landing":      "landing_page",
  "webinar":      "webinar_event",
  "event":        "webinar_event",
  "webinar/event":"webinar_event",
  "internal":     "internal",
  "other":        "other",
}

// Map buyer stage labels
const BUYER_STAGE_MAP: Record<string, BuyerStage> = {
  "awareness":     "awareness",
  "consideration": "consideration",
  "decision":      "decision",
  "retention":     "retention",
  "internal":      "internal",
}

function norm(v: unknown): string {
  return String(v ?? "").trim().toLowerCase()
}

function parseDate(v: unknown): string | null {
  if (!v) return null
  const s = String(v).trim()
  if (!s) return null

  // Try direct parse
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)

  // Excel serial number
  if (/^\d+$/.test(s)) {
    const serial = parseInt(s, 10)
    const excelEpoch = new Date(1900, 0, 1)
    excelEpoch.setDate(excelEpoch.getDate() + serial - 2)
    if (!isNaN(excelEpoch.getTime())) return excelEpoch.toISOString().slice(0, 10)
  }

  return null
}

function mapStatus(v: unknown): BoardItemStatus {
  return STATUS_MAP[norm(v)] ?? "not_started"
}

function mapPlatform(v: unknown): BoardPlatform | null {
  return PLATFORM_MAP[norm(v)] ?? null
}

function mapBuyerStage(v: unknown): BuyerStage | null {
  return BUYER_STAGE_MAP[norm(v)] ?? null
}

// Find column index in header row (case-insensitive, partial match allowed)
function findCol(headers: string[], ...candidates: string[]): number {
  for (const c of candidates) {
    const idx = headers.findIndex(h => h.toLowerCase().includes(c.toLowerCase()))
    if (idx !== -1) return idx
  }
  return -1
}

export function parseMondayExcel(buffer: ArrayBuffer): MondayParseResult {
  const workbook = XLSX.read(buffer, { type: "array" })
  const warnings: string[] = []

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { board_name: "Imported Board", groups: [], raw_columns: [], warnings: ["No sheets found"] }
  }

  const ws = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" })

  if (rows.length === 0) {
    return { board_name: sheetName, groups: [], raw_columns: [], warnings: ["Sheet is empty"] }
  }

  // Board name from first cell if it looks like a title (row 0, col 0)
  let board_name = sheetName
  const maybeTitle = String((rows[0] as unknown[])[0] ?? "").trim()
  if (maybeTitle && (rows[0] as unknown[]).filter(Boolean).length <= 2) {
    board_name = maybeTitle
  }

  // Find header row — first row where "task" or "name" appears
  let headerRowIdx = -1
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const row = rows[i] as unknown[]
    const rowStr = row.map(c => String(c ?? "").toLowerCase()).join(" ")
    if (rowStr.includes("task") || rowStr.includes("name") || rowStr.includes("item")) {
      headerRowIdx = i
      break
    }
  }

  if (headerRowIdx === -1) headerRowIdx = 0
  const headers = (rows[headerRowIdx] as unknown[]).map(h => String(h ?? "").trim())

  // Find column indices
  const taskCol     = findCol(headers, "task", "name", "item", "title")
  const ownerCol    = findCol(headers, "owner", "assignee", "person", "assigned")
  const statusCol   = findCol(headers, "status")
  const platformCol = findCol(headers, "platform")
  const stageCol    = findCol(headers, "buyer stage", "stage", "funnel")
  const dateCol     = findCol(headers, "date", "due", "deadline")
  const linkCol     = findCol(headers, "link", "url", "marketing")
  const depCol      = findCol(headers, "dependent", "dependency", "depends")

  if (taskCol === -1) warnings.push("Could not find 'Task' column — using first column")

  const effectiveTaskCol = taskCol === -1 ? 0 : taskCol

  // Parse groups and items
  const groups: ParsedBoardGroup[] = []
  let currentGroup: ParsedBoardGroup | null = null

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i] as unknown[]
    const taskVal = String(row[effectiveTaskCol] ?? "").trim()

    // Skip fully empty rows
    if (!row.some(c => String(c ?? "").trim())) continue

    // Detect group row: task column is empty but there's a value in a non-task cell
    // OR the row seems to be a group header (all same value repeated)
    const nonTaskValues = row.filter((_, idx) => idx !== effectiveTaskCol && String(_ ?? "").trim())
    if (!taskVal && nonTaskValues.length > 0) {
      const groupName = String(row.find(c => String(c ?? "").trim()) ?? "").trim()
      if (groupName) {
        currentGroup = { name: groupName, items: [] }
        groups.push(currentGroup)
        continue
      }
    }

    if (!taskVal) continue

    // Check if this row looks like a group header (e.g., the first non-empty cell that's not a header)
    const isLikelyGroup =
      taskCol !== -1 &&
      !String(row[taskCol] ?? "").trim() &&
      row.some(c => String(c ?? "").trim())

    if (isLikelyGroup) continue

    // Ensure we have a group
    if (!currentGroup) {
      currentGroup = { name: "Imported Items", items: [] }
      groups.push(currentGroup)
    }

    const item: ParsedBoardItem = {
      title: taskVal,
      owner_name: ownerCol !== -1 ? String(row[ownerCol] ?? "").trim() || null : null,
      status: statusCol !== -1 ? mapStatus(row[statusCol]) : "not_started",
      platform: platformCol !== -1 ? mapPlatform(row[platformCol]) : null,
      buyer_stage: stageCol !== -1 ? mapBuyerStage(row[stageCol]) : null,
      due_date: dateCol !== -1 ? parseDate(row[dateCol]) : null,
      link_url: linkCol !== -1 ? String(row[linkCol] ?? "").trim() || null : null,
      dependency_title: depCol !== -1 ? String(row[depCol] ?? "").trim() || null : null,
    }

    currentGroup.items.push(item)
  }

  // If no groups found, put everything in one default group
  if (groups.length === 0) {
    warnings.push("No group headers detected — all items placed in one group")
  }

  return { board_name, groups, raw_columns: headers.filter(Boolean), warnings }
}
