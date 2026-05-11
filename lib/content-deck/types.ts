// Types for the Content Deck board module (monday.com-inspired)

export type BoardItemStatus =
  | "idea_only"
  | "not_started"
  | "in_progress"
  | "in_review"
  | "dependent"
  | "approved"
  | "scheduled"
  | "published"
  | "done"
  | "blocked"

export type BoardPlatform =
  | "social_media"
  | "blog"
  | "email"
  | "video"
  | "landing_page"
  | "webinar_event"
  | "internal"
  | "other"

export type BuyerStage =
  | "awareness"
  | "consideration"
  | "decision"
  | "retention"
  | "internal"

export type BoardView = "table" | "kanban" | "gantt" | "calendar" | "files"

export interface ContentBoard {
  id: string
  workspace_id: string
  name: string
  description: string | null
  board_type: string
  health_status: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ContentGroup {
  id: string
  board_id: string
  name: string
  color: string
  order_index: number
  collapsed: boolean
  created_at: string
  updated_at: string
}

export interface BoardItem {
  id: string
  workspace_id: string
  board_id: string
  group_id: string
  title: string
  owner_id: string | null
  status: BoardItemStatus
  platform: BoardPlatform | null
  buyer_stage: BuyerStage | null
  due_date: string | null
  start_date: string | null
  link_url: string | null
  dependency_item_id: string | null
  order_index: number
  priority: string | null
  item_type: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // rich text body (HTML)
  body?: string | null
  // joined / computed
  owner_name?: string | null
  owner_avatar?: string | null
  updates_count?: number
  files_count?: number
}

export interface BoardUpdate {
  id: string
  item_id: string
  author_id: string
  body: string
  update_type: string
  created_at: string
  updated_at: string
  author_name?: string | null
  author_avatar?: string | null
}

export interface BoardFile {
  id: string
  board_id: string | null
  item_id: string | null
  update_id: string | null
  uploaded_by: string | null
  file_name: string
  file_url: string | null
  file_type: string | null
  file_size: number | null
  storage_path: string | null
  created_at: string
}

// ── Payloads ─────────────────────────────────────────────────────

export interface CreateBoardItemPayload {
  workspace_id: string
  board_id: string
  group_id: string
  title: string
  owner_id?: string | null
  status?: BoardItemStatus
  platform?: BoardPlatform | null
  buyer_stage?: BuyerStage | null
  due_date?: string | null
  start_date?: string | null
  link_url?: string | null
  dependency_item_id?: string | null
  order_index?: number
  priority?: string | null
  item_type?: string | null
  body?: string | null
  created_by?: string | null
}

export interface UpdateBoardItemPayload {
  title?: string
  owner_id?: string | null
  status?: BoardItemStatus
  platform?: BoardPlatform | null
  buyer_stage?: BuyerStage | null
  due_date?: string | null
  start_date?: string | null
  link_url?: string | null
  dependency_item_id?: string | null
  order_index?: number
  priority?: string | null
  item_type?: string | null
}

// ── UI constants ─────────────────────────────────────────────────

export const BOARD_STATUSES: BoardItemStatus[] = [
  "idea_only", "not_started", "in_progress", "in_review",
  "dependent", "approved", "scheduled", "published", "done", "blocked",
]

export const BOARD_PLATFORMS: BoardPlatform[] = [
  "social_media", "blog", "email", "video",
  "landing_page", "webinar_event", "internal", "other",
]

export const BUYER_STAGES: BuyerStage[] = [
  "awareness", "consideration", "decision", "retention", "internal",
]

export const GROUP_COLORS = [
  "#0d9488", // teal
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f97316", // orange
  "#22c55e", // green
  "#ec4899", // pink
  "#ef4444", // red
  "#eab308", // yellow
]
