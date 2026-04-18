/**
 * File: sidebar.tsx
 * Path: /components/layout/sidebar.tsx
 * Last Modified: 2026-04-17
 * Description: Sign out button: larger (text-sm, py-2.5, icon w-4 h-4).
 *              Plans nav item added. All other logic unchanged.
 */

"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Home, BarChart3, Settings, FileUp, Zap, Menu, X, FileText,
  LogOut, Crown, ChevronRight,
} from "lucide-react"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUserProfile } from "@/lib/hooks/useUserProfile"
import { signOut } from "@/lib/supabase/client"

interface SidebarProps { isOpen: boolean; onToggle: () => void }

const PLAN_BADGE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  starter: { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-600 dark:text-neutral-300", dot: "bg-neutral-400" },
  professional: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  agency: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-500" },
  enterprise: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
}
function getPlanStyle(planId: string) { return PLAN_BADGE_STYLES[planId] ?? PLAN_BADGE_STYLES.starter }

function PlanBadge({ planId, planName, isTrialing, trialDaysLeft, compact = false }: {
  planId: string; planName: string; isTrialing: boolean; trialDaysLeft: number | null; compact?: boolean
}) {
  const style = getPlanStyle(planId)
  const expiring = trialDaysLeft !== null && trialDaysLeft <= 7
  if (isTrialing) {
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${expiring ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"}`}>
        {!compact && <span className={`w-1.5 h-1.5 rounded-full ${expiring ? "bg-orange-500" : "bg-blue-500"}`} />}
        {trialDaysLeft !== null ? `Trial · ${trialDaysLeft}d` : "Trial"}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${style.bg} ${style.text}`}>
      {!compact && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {planName}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  if (role === "super_admin") return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-400">
      Super Admin
    </span>
  )
  if (role === "admin") return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
      <Crown className="w-2.5 h-2.5" />Admin
    </span>
  )
  return null
}

function UserAvatar({ avatarUrl, initials, size = "md" }: { avatarUrl: string | null; initials: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
  if (avatarUrl) return (
    <img src={avatarUrl} alt="Avatar" className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
  )
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

function SidebarNav({ pathname, isOpen, isSuperAdmin }: { pathname: string; isOpen: boolean; isSuperAdmin: boolean }) {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: BarChart3, label: "Social", href: "/?tab=social" },
    { icon: Zap, label: "Web", href: "/?tab=web" },
    { icon: FileUp, label: "Uploads", href: "/upload" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
    ...(isSuperAdmin ? [{ icon: Crown, label: "Admin", href: "/admin" }] : []),
  ]

  const isActive = (href: string) => {
    if (!mounted) return false
    const tab = searchParams.get("tab")
    if (href === "/") return pathname === "/" && (!tab || tab === "overview")
    if (href === "/?tab=social") return pathname === "/" && tab === "social"
    if (href === "/?tab=web") return pathname === "/" && tab === "web"
    return pathname === href
  }

  return (
    <TooltipProvider delayDuration={300}>
      {navItems.map(item => {
        const active = isActive(item.href)
        const isAdmin = item.label === "Admin"
        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active ? "bg-primary text-primary-foreground"
                  : isAdmin ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600"
                  : "text-neutral-400 hover:bg-accent hover:text-foreground"
                }`}>
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-primary-foreground" : isAdmin ? "" : "group-hover:text-foreground"}`} />
                {isOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium" style={{ display: isOpen ? "none" : undefined }}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </TooltipProvider>
  )
}

function ProfileSection({ isOpen }: { isOpen: boolean }) {
  const { fullName, email, avatarUrl, initials, role, planId, planName, isTrialing, trialDaysLeft, isLoading } = useUserProfile()
  const isSuperAdmin = role === "super_admin"
  const isAdmin = role === "admin"
  const showRoleBadge = isSuperAdmin || isAdmin

  if (!isOpen) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => signOut()}
              className="w-full p-2 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
              {isLoading ? <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" /> : <UserAvatar avatarUrl={avatarUrl} initials={initials} size="sm" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            <p className="font-semibold">{fullName ?? email ?? "Profile"}</p>
            {showRoleBadge && <p className="text-xs text-amber-400">{isSuperAdmin ? "Super Admin" : "Admin"}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (isLoading) {
    return (
      <div className="px-3 py-2 space-y-2 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
            <div className="h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded w-32" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-2 space-y-2">
      <Link href="/settings" className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors group">
        <UserAvatar avatarUrl={avatarUrl} initials={initials} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate leading-tight">{fullName ?? email ?? "User"}</p>
          {email && fullName && <p className="text-xs text-neutral-400 truncate mt-0.5">{email}</p>}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </Link>

      <div className="px-2 flex items-center gap-1.5 flex-wrap">
        {showRoleBadge ? <RoleBadge role={role} /> : <PlanBadge planId={planId} planName={planName} isTrialing={isTrialing} trialDaysLeft={trialDaysLeft} />}
        {showRoleBadge && <PlanBadge planId={planId} planName={planName} isTrialing={isTrialing} trialDaysLeft={trialDaysLeft} compact />}
      </div>

      {isTrialing && !showRoleBadge && trialDaysLeft !== null && trialDaysLeft <= 7 && (
        <Link href="/pricing" className="mx-2 flex items-center gap-1 text-[11px] font-medium text-orange-600 dark:text-orange-400 hover:underline">
          {trialDaysLeft === 0 ? "Trial expired" : `${trialDaysLeft} days left`} · Upgrade →
        </Link>
      )}

      {/* ── SIGN OUT — bigger, more visible ── */}
      <button
        onClick={() => signOut()}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-red-500 hover:bg-red-500/5 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  )
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { role } = useUserProfile()
  const isSuperAdmin = role === "super_admin" || role === "admin"

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col z-50 ${isOpen ? "w-64" : "w-20"}`}>
      <div className={`p-6 flex items-center ${isOpen ? "justify-between" : "justify-center"}`}>
        {isOpen && (
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CONDOR</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Analytics</p>
          </div>
        )}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onToggle} className="p-2 hover:bg-accent rounded-lg transition-colors text-foreground">
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side={isOpen ? "bottom" : "right"} className="font-medium">
              {isOpen ? "Collapse sidebar" : "Expand sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <nav className="space-y-1 flex-1 px-3 overflow-y-auto">
        <Suspense fallback={null}>
          <SidebarNav pathname={pathname} isOpen={isOpen} isSuperAdmin={isSuperAdmin} />
        </Suspense>
      </nav>

      <div className="border-t border-border mt-2">
        <ProfileSection isOpen={isOpen} />
      </div>
    </aside>
  )
}