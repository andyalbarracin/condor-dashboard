import type { ContentBoard, ContentGroup, BoardItem } from "./types"

const BOARD_ID = "mock-board-001"
const BOARD_ID_2 = "mock-board-002"
const WS_ID = "mock-workspace"

export const MOCK_BOARDS: ContentBoard[] = [
  {
    id: BOARD_ID,
    workspace_id: WS_ID,
    name: "Nov: _old board",
    description: null, board_type: "content", health_status: null, created_by: null,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
  },
  {
    id: BOARD_ID_2,
    workspace_id: WS_ID,
    name: "Dec: Backup/Templates",
    description: null, board_type: "content", health_status: null, created_by: null,
    created_at: "2024-12-01T00:00:00Z", updated_at: "2024-12-01T00:00:00Z",
  },
]

export const MOCK_BOARD: ContentBoard = {
  id: BOARD_ID,
  workspace_id: WS_ID,
  name: "Nov: _old board",
  description: null,
  board_type: "content",
  health_status: null,
  created_by: null,
  created_at: "2024-11-01T00:00:00Z",
  updated_at: "2024-11-01T00:00:00Z",
}

export const MOCK_GROUPS: ContentGroup[] = [
  {
    id: "grp-1", board_id: BOARD_ID, name: "WEEK 1 (November 1-9)",
    color: "#0d9488", order_index: 0, collapsed: false,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
  },
  {
    id: "grp-2", board_id: BOARD_ID, name: "WEEK 2 (November 10-16)",
    color: "#3b82f6", order_index: 1, collapsed: false,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
  },
  {
    id: "grp-3", board_id: BOARD_ID, name: "WEEK 3 (November 17-23)",
    color: "#8b5cf6", order_index: 2, collapsed: false,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
  },
  {
    id: "grp-4", board_id: BOARD_ID, name: "WEEK 4 (November 24-30)",
    color: "#f97316", order_index: 3, collapsed: false,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
  },
]

export const MOCK_ITEMS: BoardItem[] = [
  // WEEK 1
  {
    id: "item-1", workspace_id: WS_ID, board_id: BOARD_ID, group_id: "grp-1",
    title: "Power Behind The Plug: Veterans Day",
    owner_id: null, status: "not_started", platform: "social_media",
    buyer_stage: "awareness", due_date: "2024-11-05", start_date: null,
    link_url: null, dependency_item_id: null, order_index: 0,
    priority: null, item_type: null, created_by: null,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
    owner_name: "Rachel A.", owner_avatar: null, updates_count: 1, files_count: 0,
  },
  {
    id: "item-2", workspace_id: WS_ID, board_id: BOARD_ID, group_id: "grp-1",
    title: "Promote HA-TATS",
    owner_id: null, status: "idea_only", platform: "social_media",
    buyer_stage: null, due_date: null, start_date: null,
    link_url: null, dependency_item_id: null, order_index: 1,
    priority: null, item_type: null, created_by: null,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
    owner_name: null, owner_avatar: null, updates_count: 0, files_count: 0,
  },
  {
    id: "item-3", workspace_id: WS_ID, board_id: BOARD_ID, group_id: "grp-1",
    title: "Social Media post on TSH",
    owner_id: null, status: "dependent", platform: "social_media",
    buyer_stage: "awareness", due_date: "2024-09-05", start_date: null,
    link_url: null, dependency_item_id: null, order_index: 2,
    priority: null, item_type: null, created_by: null,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
    owner_name: "Sarah H.", owner_avatar: null, updates_count: 0, files_count: 0,
  },
  // WEEK 2
  {
    id: "item-4", workspace_id: WS_ID, board_id: BOARD_ID, group_id: "grp-2",
    title: "Social Media: Veterans Day",
    owner_id: null, status: "not_started", platform: "social_media",
    buyer_stage: "awareness", due_date: "2024-11-11", start_date: null,
    link_url: null, dependency_item_id: null, order_index: 0,
    priority: null, item_type: null, created_by: null,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
    owner_name: "Sarah H.", owner_avatar: null, updates_count: 1, files_count: 0,
  },
  {
    id: "item-5", workspace_id: WS_ID, board_id: BOARD_ID, group_id: "grp-2",
    title: "Time Sync Hub on Trystar.com",
    owner_id: null, status: "in_progress", platform: "blog",
    buyer_stage: "awareness", due_date: "2024-08-06", start_date: null,
    link_url: "https://trystar.com", dependency_item_id: null, order_index: 1,
    priority: null, item_type: null, created_by: null,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
    owner_name: "Scott H.", owner_avatar: null, updates_count: 2, files_count: 1,
  },
  // WEEK 3
  {
    id: "item-6", workspace_id: WS_ID, board_id: BOARD_ID, group_id: "grp-3",
    title: "Email Campaign: Black Friday Prep",
    owner_id: null, status: "not_started", platform: "email",
    buyer_stage: "decision", due_date: "2024-11-20", start_date: null,
    link_url: null, dependency_item_id: null, order_index: 0,
    priority: null, item_type: null, created_by: null,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
    owner_name: "Rachel A.", owner_avatar: null, updates_count: 0, files_count: 0,
  },
  {
    id: "item-7", workspace_id: WS_ID, board_id: BOARD_ID, group_id: "grp-3",
    title: "LinkedIn Thought Leadership Post",
    owner_id: null, status: "in_review", platform: "social_media",
    buyer_stage: "consideration", due_date: "2024-11-22", start_date: null,
    link_url: null, dependency_item_id: null, order_index: 1,
    priority: null, item_type: null, created_by: null,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
    owner_name: "Scott H.", owner_avatar: null, updates_count: 3, files_count: 2,
  },
  // WEEK 4
  {
    id: "item-8", workspace_id: WS_ID, board_id: BOARD_ID, group_id: "grp-4",
    title: "Year-End Recap Blog Post",
    owner_id: null, status: "not_started", platform: "blog",
    buyer_stage: "retention", due_date: "2024-11-28", start_date: null,
    link_url: null, dependency_item_id: null, order_index: 0,
    priority: null, item_type: null, created_by: null,
    created_at: "2024-11-01T00:00:00Z", updated_at: "2024-11-01T00:00:00Z",
    owner_name: null, owner_avatar: null, updates_count: 0, files_count: 0,
  },
]
