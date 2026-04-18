/**
 * File: useUserProfile.ts
 * Path: /lib/hooks/useUserProfile.ts
 * Last Modified: 2026-04-17
 * Description: Hook for current user profile + subscription data from Supabase.
 *   Added module-level in-memory cache (5-minute TTL) to prevent repeated
 *   Supabase calls on every page navigation — fixes the "Loading..." flash in header/sidebar.
 *   Cache is invalidated on SIGNED_OUT event.
 */

"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserRole, SubscriptionStatus } from "@/lib/supabase/types"

export interface UserProfileData {
  userId: string | null
  email: string | null
  fullName: string | null
  avatarUrl: string | null
  initials: string
  role: UserRole
  planId: string
  planName: string
  planStatus: SubscriptionStatus
  trialDaysLeft: number | null
  isTrialing: boolean
  isPaid: boolean
  isLoading: boolean
  isAuthenticated: boolean
}

const DEFAULT_STATE: UserProfileData = {
  userId: null, email: null, fullName: null, avatarUrl: null, initials: "?",
  role: "user", planId: "starter", planName: "Nest", planStatus: "trialing",
  trialDaysLeft: null, isTrialing: true, isPaid: false, isLoading: true, isAuthenticated: false,
}

// ================================================================
// MODULE-LEVEL CACHE — shared across all hook instances in the session
// ================================================================
let _cache: UserProfileData | null = null
let _cacheAt = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function isCacheValid() {
  return _cache !== null && (Date.now() - _cacheAt) < CACHE_TTL_MS
}

function setCache(data: UserProfileData) {
  _cache = data
  _cacheAt = Date.now()
}

function clearCache() {
  _cache = null
  _cacheAt = 0
}

// ================================================================
// HELPERS
// ================================================================

function computeInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.trim()[0]?.toUpperCase() ?? "?"
  }
  if (email) return email[0].toUpperCase()
  return "?"
}

function computeTrialDaysLeft(trialEnd: string | null, status: string): number | null {
  if (status !== "trialing" || !trialEnd) return null
  const ms = new Date(trialEnd).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

// ================================================================
// HOOK
// ================================================================

export function useUserProfile(): UserProfileData {
  // If cache is valid, start with it immediately (no loading flash)
  const [data, setData] = useState<UserProfileData>(() => {
    if (isCacheValid() && _cache) return { ..._cache, isLoading: false }
    return DEFAULT_STATE
  })

  const loadProfile = useCallback(async () => {
    // Return early if cache is valid — no need to refetch
    if (isCacheValid() && _cache) {
      setData({ ..._cache, isLoading: false })
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        const unauthenticated = { ...DEFAULT_STATE, isLoading: false, isAuthenticated: false }
        setCache(unauthenticated)
        setData(unauthenticated)
        return
      }

      const [profileResult, subscriptionResult] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url, role, email, job_title").eq("id", user.id).single(),
        supabase.from("subscriptions").select("plan_id, status, trial_end, subscription_plans(name)").eq("user_id", user.id).single(),
      ])

      const profile = profileResult.data

      type SubRow = { plan_id: string; status: string; trial_end: string | null; subscription_plans: { name: string } | { name: string }[] | null }
      const sub = subscriptionResult.data as SubRow | null
      let planName = "Nest"
      if (sub?.subscription_plans) {
        const plans = sub.subscription_plans
        planName = Array.isArray(plans) ? (plans[0]?.name ?? "Nest") : plans.name
      }

      const status = (sub?.status ?? "trialing") as SubscriptionStatus
      const trialDaysLeft = computeTrialDaysLeft(sub?.trial_end ?? null, status)
      const email = profile?.email ?? user.email ?? null
      const fullName = profile?.full_name ?? null

      const result: UserProfileData = {
        userId: user.id,
        email,
        fullName,
        avatarUrl: profile?.avatar_url ?? null,
        initials: computeInitials(fullName, email),
        role: (profile?.role ?? "user") as UserRole,
        planId: sub?.plan_id ?? "starter",
        planName,
        planStatus: status,
        trialDaysLeft,
        isTrialing: status === "trialing",
        isPaid: status === "active",
        isLoading: false,
        isAuthenticated: true,
      }

      setCache(result)
      setData(result)
    } catch (err) {
      console.error("[useUserProfile]", err)
      setData({ ...DEFAULT_STATE, isLoading: false })
    }
  }, [])

  useEffect(() => {
    loadProfile()

    const supabase = createClient()
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        clearCache()
        loadProfile()
      }
      if (event === "SIGNED_OUT") {
        clearCache()
        setData({ ...DEFAULT_STATE, isLoading: false, isAuthenticated: false })
      }
    })

    return () => authSub.unsubscribe()
  }, [loadProfile])

  return data
}