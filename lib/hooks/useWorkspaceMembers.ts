"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface WorkspaceMember {
  user_id: string
  role: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
}

export function useWorkspaceMembers(workspaceId: string | null) {
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    let cancelled = false
    setIsLoading(true)

    const load = async () => {
      try {
        const supabase = createClient()

        // Get workspace owner
        const { data: workspace } = await supabase
          .from("workspaces")
          .select("owner_id, profiles!inner(id, full_name, avatar_url)")
          .eq("id", workspaceId)
          .maybeSingle()

        // Get workspace members
        const { data: memberRows } = await supabase
          .from("workspace_members")
          .select("user_id, role, profiles!inner(full_name, avatar_url)")
          .eq("workspace_id", workspaceId)

        if (cancelled) return

        const result: WorkspaceMember[] = []

        if (workspace) {
          const ownerProfile = Array.isArray(workspace.profiles)
            ? workspace.profiles[0]
            : workspace.profiles as { id: string; full_name: string | null; avatar_url: string | null } | null
          if (ownerProfile) {
            result.push({
              user_id: workspace.owner_id as string,
              role: "owner",
              full_name: ownerProfile.full_name,
              avatar_url: ownerProfile.avatar_url,
              email: null,
            })
          }
        }

        for (const m of memberRows ?? []) {
          const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles as { full_name: string | null; avatar_url: string | null } | null
          if (p) {
            result.push({
              user_id: m.user_id as string,
              role: m.role as string,
              full_name: p.full_name,
              avatar_url: p.avatar_url,
              email: null,
            })
          }
        }

        setMembers(result)
      } catch {
        // silently fail — @mentions just won't show suggestions
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [workspaceId])

  return { members, isLoading }
}
