"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { MOCK_BOARDS, MOCK_BOARD, MOCK_GROUPS, MOCK_ITEMS } from "@/lib/content-deck/mock-data"
import { GROUP_COLORS } from "@/lib/content-deck/types"
import type {
  ContentBoard, ContentGroup, BoardItem,
  CreateBoardItemPayload, UpdateBoardItemPayload,
} from "@/lib/content-deck/types"

interface UseContentBoardReturn {
  // Board list & selection
  boards: ContentBoard[]
  board: ContentBoard | null
  workspaceId: string | null
  workspaceName: string | null
  // Active board data
  groups: ContentGroup[]
  items: BoardItem[]
  // State
  isLoading: boolean
  error: string | null
  isMock: boolean
  refetch: () => void
  // Board CRUD
  switchBoard: (id: string) => void
  createBoard: (name: string) => Promise<ContentBoard | null>
  updateBoard: (id: string, payload: { name?: string }) => Promise<void>
  deleteBoard: (id: string) => Promise<void>
  duplicateBoard: (id: string) => Promise<ContentBoard | null>
  // Item CRUD
  createItem: (payload: CreateBoardItemPayload) => Promise<BoardItem | null>
  updateItem: (id: string, payload: UpdateBoardItemPayload) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  // Group CRUD
  createGroup: (name: string, color?: string) => Promise<ContentGroup | null>
  updateGroup: (id: string, payload: { name?: string; color?: string; collapsed?: boolean }) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  duplicateGroup: (id: string) => Promise<ContentGroup | null>
  toggleGroupCollapsed: (groupId: string) => void
}

async function fetchWorkspaceInfo(): Promise<{ id: string; name: string } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ? { id: data.id as string, name: (data.name as string) ?? "Workspace" } : null
}

export function useContentBoard(): UseContentBoardReturn {
  const [boards, setBoards] = useState<ContentBoard[]>([])
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const [groups, setGroups] = useState<ContentGroup[]>([])
  const [items, setItems] = useState<BoardItem[]>([])
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  const board = boards.find(b => b.id === activeBoardId) ?? null

  // Load board data for active board
  const loadBoardData = useCallback(async (boardId: string, supabase: ReturnType<typeof createClient>) => {
    const [{ data: groupData }, { data: itemData }] = await Promise.all([
      supabase.from("content_groups").select("*").eq("board_id", boardId).order("order_index"),
      supabase.from("content_board_items").select("*").eq("board_id", boardId).order("order_index"),
    ])
    setGroups((groupData ?? []) as ContentGroup[])
    setItems((itemData ?? []) as BoardItem[])
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const wsInfo = await fetchWorkspaceInfo()
        if (cancelled) return

        if (!wsInfo) {
          setIsMock(true)
          setBoards(MOCK_BOARDS)
          setActiveBoardId(MOCK_BOARD.id)
          setGroups(MOCK_GROUPS)
          setItems(MOCK_ITEMS)
          setIsLoading(false)
          return
        }

        setWorkspaceId(wsInfo.id)
        setWorkspaceName(wsInfo.name)
        const supabase = createClient()

        const { data: boardList, error: boardErr } = await supabase
          .from("content_boards")
          .select("*")
          .eq("workspace_id", wsInfo.id)
          .order("created_at", { ascending: true })

        if (boardErr || !boardList || boardList.length === 0) {
          if (!cancelled) {
            setIsMock(true)
            setBoards([{ ...MOCK_BOARD, workspace_id: wsInfo.id }, ...MOCK_BOARDS.slice(1)])
            setActiveBoardId(MOCK_BOARD.id)
            setGroups(MOCK_GROUPS)
            setItems(MOCK_ITEMS)
            setIsLoading(false)
          }
          return
        }

        const typedBoards = boardList as ContentBoard[]
        const firstBoardId = activeBoardId && typedBoards.find(b => b.id === activeBoardId)
          ? activeBoardId
          : typedBoards[0].id

        if (!cancelled) {
          setBoards(typedBoards)
          setActiveBoardId(firstBoardId)
          setIsMock(false)
          await loadBoardData(firstBoardId, supabase)
          setIsLoading(false)
        }
      } catch {
        if (!cancelled) {
          setIsMock(true)
          setBoards(MOCK_BOARDS)
          setActiveBoardId(MOCK_BOARD.id)
          setGroups(MOCK_GROUPS)
          setItems(MOCK_ITEMS)
          setIsLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  // Switch to a different board
  const switchBoard = useCallback(async (id: string) => {
    setActiveBoardId(id)
    if (isMock) {
      if (id === MOCK_BOARD.id) {
        setGroups(MOCK_GROUPS)
        setItems(MOCK_ITEMS)
      } else {
        setGroups([])
        setItems([])
      }
      return
    }
    const supabase = createClient()
    await loadBoardData(id, supabase)
  }, [isMock, loadBoardData])

  // ── Board CRUD ────────────────────────────────────────────────

  const createBoard = useCallback(async (name: string): Promise<ContentBoard | null> => {
    const now = new Date().toISOString()

    if (isMock) {
      const newBoard: ContentBoard = {
        id: `board-${Date.now()}`, workspace_id: workspaceId ?? "mock-workspace",
        name, description: null, board_type: "content", health_status: null,
        created_by: null, created_at: now, updated_at: now,
      }
      setBoards(prev => [...prev, newBoard])
      setActiveBoardId(newBoard.id)
      setGroups([])
      setItems([])
      return newBoard
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("content_boards")
        .insert({ workspace_id: workspaceId, name, board_type: "content" })
        .select().single()
      if (error) throw error
      const nb = data as ContentBoard
      setBoards(prev => [...prev, nb])
      setActiveBoardId(nb.id)
      setGroups([])
      setItems([])
      return nb
    } catch (err) { console.error(err); return null }
  }, [isMock, workspaceId])

  const updateBoard = useCallback(async (id: string, payload: { name?: string }): Promise<void> => {
    setBoards(prev => prev.map(b => b.id === id ? { ...b, ...payload, updated_at: new Date().toISOString() } : b))
    if (isMock) return
    try {
      const supabase = createClient()
      await supabase.from("content_boards").update(payload).eq("id", id)
    } catch (err) { console.error(err) }
  }, [isMock])

  const deleteBoard = useCallback(async (id: string): Promise<void> => {
    setBoards(prev => {
      const next = prev.filter(b => b.id !== id)
      if (activeBoardId === id && next.length > 0) {
        setActiveBoardId(next[0].id)
        if (isMock) { setGroups([]); setItems([]) }
      }
      return next
    })
    if (isMock) return
    try {
      const supabase = createClient()
      await supabase.from("content_boards").delete().eq("id", id)
    } catch (err) { console.error(err) }
  }, [isMock, activeBoardId])

  const duplicateBoard = useCallback(async (id: string): Promise<ContentBoard | null> => {
    const source = boards.find(b => b.id === id)
    if (!source) return null
    const name = `${source.name} (copy)`
    return createBoard(name)
  }, [boards, createBoard])

  // ── Group CRUD ────────────────────────────────────────────────

  const createGroup = useCallback(async (name: string, color?: string): Promise<ContentGroup | null> => {
    const now = new Date().toISOString()
    const nextColor = color ?? GROUP_COLORS[groups.length % GROUP_COLORS.length]
    const orderIndex = groups.length

    if (isMock || !activeBoardId) {
      const ng: ContentGroup = {
        id: `grp-${Date.now()}`,
        board_id: activeBoardId ?? MOCK_BOARD.id,
        name, color: nextColor, order_index: orderIndex, collapsed: false,
        created_at: now, updated_at: now,
      }
      setGroups(prev => [...prev, ng])
      return ng
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("content_groups")
        .insert({ board_id: activeBoardId, name, color: nextColor, order_index: orderIndex })
        .select().single()
      if (error) throw error
      const ng = data as ContentGroup
      setGroups(prev => [...prev, ng])
      return ng
    } catch (err) { console.error(err); return null }
  }, [isMock, activeBoardId, groups.length])

  const updateGroup = useCallback(async (
    id: string,
    payload: { name?: string; color?: string; collapsed?: boolean }
  ): Promise<void> => {
    setGroups(prev => prev.map(g =>
      g.id === id ? { ...g, ...payload, updated_at: new Date().toISOString() } : g
    ))
    if (isMock) return
    try {
      const supabase = createClient()
      await supabase.from("content_groups").update(payload).eq("id", id)
    } catch (err) { console.error(err) }
  }, [isMock])

  const deleteGroup = useCallback(async (id: string): Promise<void> => {
    setGroups(prev => prev.filter(g => g.id !== id))
    setItems(prev => prev.filter(i => i.group_id !== id))
    if (isMock) return
    try {
      const supabase = createClient()
      await supabase.from("content_groups").delete().eq("id", id)
    } catch (err) { console.error(err) }
  }, [isMock])

  const duplicateGroup = useCallback(async (id: string): Promise<ContentGroup | null> => {
    const source = groups.find(g => g.id === id)
    if (!source) return null
    const now = new Date().toISOString()
    const ng = await createGroup(`${source.name} (copy)`, source.color)
    if (!ng) return null
    // Duplicate all items in the group
    const groupItems = items.filter(i => i.group_id === id)
    const newItems: BoardItem[] = groupItems.map((item, idx) => ({
      ...item,
      id: `item-${Date.now()}-${idx}`,
      group_id: ng.id,
      created_at: now,
      updated_at: now,
    }))
    setItems(prev => [...prev, ...newItems])
    if (!isMock) {
      try {
        const supabase = createClient()
        await supabase.from("content_board_items").insert(
          newItems.map(({ owner_name, owner_avatar, updates_count, files_count, body: _body, ...rest }) => rest)
        )
      } catch (err) { console.error(err) }
    }
    return ng
  }, [groups, items, createGroup, isMock])

  const toggleGroupCollapsed = useCallback((groupId: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, collapsed: !g.collapsed } : g))
  }, [])

  // ── Item CRUD ─────────────────────────────────────────────────

  const createItem = useCallback(async (payload: CreateBoardItemPayload): Promise<BoardItem | null> => {
    if (isMock) {
      const newItem: BoardItem = {
        ...payload,
        id: `item-${Date.now()}`,
        owner_id: payload.owner_id ?? null,
        status: payload.status ?? "not_started",
        platform: payload.platform ?? null,
        buyer_stage: payload.buyer_stage ?? null,
        due_date: payload.due_date ?? null,
        start_date: payload.start_date ?? null,
        link_url: payload.link_url ?? null,
        dependency_item_id: payload.dependency_item_id ?? null,
        order_index: payload.order_index ?? 0,
        priority: payload.priority ?? null,
        item_type: payload.item_type ?? null,
        body: payload.body ?? null,
        created_by: payload.created_by ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updates_count: 0,
        files_count: 0,
      }
      setItems(prev => [...prev, newItem])
      return newItem
    }
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("content_board_items").insert(payload).select().single()
      if (error) throw error
      const item = data as BoardItem
      setItems(prev => [...prev, item])
      return item
    } catch (err) { console.error(err); return null }
  }, [isMock])

  const updateItem = useCallback(async (id: string, payload: UpdateBoardItemPayload): Promise<void> => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...payload, updated_at: new Date().toISOString() } : item
    ))
    if (isMock) return
    try {
      const supabase = createClient()
      await supabase.from("content_board_items").update(payload).eq("id", id)
    } catch (err) { console.error(err) }
  }, [isMock])

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    setItems(prev => prev.filter(item => item.id !== id))
    if (isMock) return
    try {
      const supabase = createClient()
      await supabase.from("content_board_items").delete().eq("id", id)
    } catch (err) { console.error(err) }
  }, [isMock])

  return {
    boards, board, workspaceId, workspaceName,
    groups, items,
    isLoading, error, isMock, refetch,
    switchBoard, createBoard, updateBoard, deleteBoard, duplicateBoard,
    createItem, updateItem, deleteItem,
    createGroup, updateGroup, deleteGroup, duplicateGroup,
    toggleGroupCollapsed,
  }
}
