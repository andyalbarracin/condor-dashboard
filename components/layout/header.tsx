/**
 * File: header.tsx
 * Path: /components/layout/header.tsx
 * Last Modified: 2026-04-17
 * Description: "Plans & Billing" → "Plans". Support → Link to /support (not mailto).
 */

"use client"

import { Moon, Sun, Search, Bell, Settings, HelpCircle, LogOut, Crown, ExternalLink } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useUserProfile } from "@/lib/hooks/useUserProfile"
import { signOut } from "@/lib/supabase/client"

const PLAN_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  starter: { bg: "bg-neutral-100 dark:bg-neutral-700", text: "text-neutral-600 dark:text-neutral-300" },
  professional: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  agency: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  enterprise: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
}

function HeaderPlanBadge({ planId, planName, role, isTrialing, trialDaysLeft }: {
  planId: string; planName: string; role: string; isTrialing: boolean; trialDaysLeft: number | null
}) {
  if (role === "super_admin") return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-400">
      Super Admin
    </span>
  )
  if (role === "admin") return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-1">
      <Crown className="w-2.5 h-2.5" />Admin
    </span>
  )
  const style = PLAN_BADGE_STYLES[planId] ?? PLAN_BADGE_STYLES.starter
  if (isTrialing) {
    const expiring = trialDaysLeft !== null && trialDaysLeft <= 7
    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${expiring ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"}`}>
        {trialDaysLeft !== null ? `Trial · ${trialDaysLeft} days left` : "Trial"}
      </span>
    )
  }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{planName}</span>
}

function HeaderAvatar({ avatarUrl, initials }: { avatarUrl: string | null; initials: string }) {
  if (avatarUrl) return (
    <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover"
      onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
  )
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
      {initials}
    </div>
  )
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { fullName, email, avatarUrl, initials, role, planId, planName, isTrialing, trialDaysLeft, isLoading } = useUserProfile()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => { setIsProfileOpen(false); await signOut() }
  const displayName = fullName ?? email ?? "User"

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between gap-8">

          <div className="flex-1 max-w-md">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-neutral-500" />
              <input type="text" placeholder="Search or type command..."
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-primary" />
              <span className="absolute right-3 text-xs text-neutral-500 bg-card-hover px-2 py-1 rounded">⌘ K</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-card-hover transition-colors text-neutral-400 hover:text-foreground"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="p-2 rounded-lg hover:bg-card-hover transition-colors text-neutral-400 hover:text-foreground relative" title="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            </button>

            <div className="relative" ref={profileRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-card-hover transition-colors">
                {isLoading ? <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" /> : <HeaderAvatar avatarUrl={avatarUrl} initials={initials} />}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground leading-tight max-w-[120px] truncate">
                    {isLoading ? "Loading..." : displayName}
                  </p>
                  {!isLoading && <HeaderPlanBadge planId={planId} planName={planName} role={role} isTrialing={isTrialing} trialDaysLeft={trialDaysLeft} />}
                </div>
                <svg className={`w-3.5 h-3.5 text-neutral-400 transition-transform hidden sm:block ${isProfileOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <HeaderAvatar avatarUrl={avatarUrl} initials={initials} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                        {email && <p className="text-xs text-neutral-500 truncate mt-0.5">{email}</p>}
                      </div>
                    </div>
                    <div className="mt-2">
                      <HeaderPlanBadge planId={planId} planName={planName} role={role} isTrialing={isTrialing} trialDaysLeft={trialDaysLeft} />
                    </div>
                    {isTrialing && role === "user" && trialDaysLeft !== null && trialDaysLeft <= 7 && (
                      <Link href="/pricing" onClick={() => setIsProfileOpen(false)}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline">
                        <ExternalLink className="w-3 h-3" />
                        {trialDaysLeft === 0 ? "Trial expired" : `${trialDaysLeft} days left`} · Upgrade now
                      </Link>
                    )}
                  </div>

                  <div className="py-1.5">
                    <Link href="/settings" onClick={() => setIsProfileOpen(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-card-hover transition-colors flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-neutral-400" />
                      Settings
                    </Link>

                    {/* Plans — NOT "Plans & Billing" */}
                    <Link href="/pricing" onClick={() => setIsProfileOpen(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-card-hover transition-colors flex items-center gap-2.5">
                      <Crown className="w-4 h-4 text-neutral-400" />
                      Plans
                    </Link>

                    {/* Support → goes to /support PAGE, not mailto */}
                    <Link href="/support" onClick={() => setIsProfileOpen(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-card-hover transition-colors flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-neutral-400" />
                      Support
                    </Link>

                    <hr className="my-1 border-border" />

                    <button onClick={handleSignOut}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/5 transition-colors flex items-center gap-2.5">
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}