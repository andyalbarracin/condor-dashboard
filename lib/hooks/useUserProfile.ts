/**
 * File: useUserProfile.ts
 * Path: /lib/hooks/useUserProfile.ts
 * Last Modified: 2026-04-19
 * Fixes:
 *   1. Added CustomEvent listener for 'condor:profile-updated' → header re-fetches
 *      immediately when Settings saves (no page reload needed)
 *   2. Workspace query: .single() → .maybeSingle() + order by updated_at DESC
 *      so it never throws, and returns the most recently updated workspace
 *      (handles the case where a user has multiple workspace rows)
 *   3. Two-level cache: memory (5min) + localStorage (30min) for instant load
 */

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const PLAN_NAMES: Record<string, string> = {
  starter: "Nest",
  professional: "Flight",
  agency: "Altitude",
  enterprise: "Apex",
}

interface UserProfileData {
  fullName: string | null
  email: string | null
  avatarUrl: string | null
  initials: string
  role: string
  planId: string
  planName: string
  isTrialing: boolean
  trialDaysLeft: number | null
  workspaceName: string | null
}

const DEFAULT: UserProfileData = {
  fullName: null, email: null, avatarUrl: null, initials: "?",
  role: "user", planId: "starter", planName: "Nest",
  isTrialing: false, trialDaysLeft: null, workspaceName: null,
}

// ── Memory cache (5-min TTL) ──────────────────────────────────────
let memCache: { data: UserProfileData; ts: number } | null = null
const MEM_TTL = 5 * 60 * 1000

// ── localStorage cache (30-min TTL) ──────────────────────────────
const LS_KEY = "condor_user_profile_cache"
const LS_TTL = 30 * 60 * 1000

function readLS(): UserProfileData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw) as { data: UserProfileData; ts: number }
    if (Date.now() - ts > LS_TTL) { localStorage.removeItem(LS_KEY); return null }
    return data
  } catch { return null }
}

function writeLS(data: UserProfileData) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(LS_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

/** Call before dispatching 'condor:profile-updated' */
export function clearUserProfileCache() {
  memCache = null
  if (typeof window !== "undefined") localStorage.removeItem(LS_KEY)
}

function buildInitials(name: string | null, email: string | null): string {
  if (name?.trim()) {
    return name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("")
  }
  return email?.[0]?.toUpperCase() ?? "?"
}

export function useUserProfile() {
  const seed = memCache ? memCache.data : (typeof window !== "undefined" ? readLS() : null)
  const [profile, setProfile] = useState<UserProfileData>(seed ?? DEFAULT)
  const [isLoading, setIsLoading] = useState(!seed)
  const [refreshKey, setRefreshKey] = useState(0)

  // ── FIX 1: Listen for profile-updated event from Settings save ──
  // When Settings calls clearUserProfileCache() + dispatches this event,
  // ALL mounted instances of useUserProfile (including Header) re-fetch.
  useEffect(() => {
    const handler = () => {
      // Force re-fetch by incrementing key (bypasses cache check below)
      setRefreshKey(k => k + 1)
    }
    window.addEventListener("condor:profile-updated", handler)
    return () => window.removeEventListener("condor:profile-updated", handler)
  }, [])

  // ── Fetch from DB ───────────────────────────────────────────────
  useEffect(() => {
    // Skip if memory cache is fresh AND this is not a forced refresh
    if (refreshKey === 0 && memCache && Date.now() - memCache.ts < MEM_TTL) {
      setProfile(memCache.data)
      setIsLoading(false)
      return
    }

    let cancelled = false
    const doFetch = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || cancelled) return

        // Run all queries in parallel
        const [profileRes, subRes, wsRes] = await Promise.all([
          supabase.from("profiles")
            .select("full_name, avatar_url, role")
            .eq("id", user.id)
            .single(),

          supabase.from("subscriptions")
            .select("status, trial_end, plan_id, subscription_plans(name)")
            .eq("user_id", user.id)
            .maybeSingle(),

          // FIX 2: maybeSingle() never throws on 0 rows.
          // order by updated_at DESC → returns most recently saved workspace
          // (handles duplicate workspace rows gracefully)
          supabase.from("workspaces")
            .select("name")
            .eq("owner_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])

        if (cancelled) return

        const fullName   = profileRes.data?.full_name ?? null
        const avatarUrl  = profileRes.data?.avatar_url ?? null
        const role       = profileRes.data?.role ?? "user"

        const planId     = subRes.data?.plan_id ?? "starter"
        const rawPlans   = subRes.data?.subscription_plans
        const rawName    = Array.isArray(rawPlans)
          ? (rawPlans[0] as { name?: string } | undefined)?.name
          : (rawPlans as unknown as { name?: string } | null | undefined)?.name
        const planName   = rawName ?? PLAN_NAMES[planId] ?? "Nest"

        const isTrialing = subRes.data?.status === "trialing"
        let trialDaysLeft: number | null = null
        if (isTrialing && subRes.data?.trial_end) {
          trialDaysLeft = Math.max(0, Math.ceil(
            (new Date(subRes.data.trial_end).getTime() - Date.now()) / 86400000
          ))
        }

        // workspaceName: from DB or null (header shows "My Project" as fallback)
        const workspaceName = wsRes.data?.name ?? null

        const data: UserProfileData = {
          fullName,
          email:       user.email ?? null,
          avatarUrl,
          initials:    buildInitials(fullName, user.email ?? null),
          role, planId, planName, isTrialing, trialDaysLeft, workspaceName,
        }

        memCache = { data, ts: Date.now() }
        writeLS(data)
        if (!cancelled) setProfile(data)
      } catch (err) {
        console.error("[useUserProfile]", err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    doFetch()
    return () => { cancelled = true }
  }, [refreshKey]) // ← re-runs on forced refresh (event) or first mount

  return { ...profile, isLoading }
}