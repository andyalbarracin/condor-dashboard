/**
 * File: sidebar.tsx
 * Path: /components/layout/sidebar.tsx
 * Last Modified: 2026-01-20
 * Description: Sidebar con tooltips - SIN hydration mismatch
 */

"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, BarChart3, Settings, FileUp, Zap, Menu, X, FileText } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

// Componente que usa useSearchParams - DEBE estar en Suspense
function SidebarNav({ pathname, isOpen }: { pathname: string; isOpen: boolean }) {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: BarChart3, label: "Social", href: "/?tab=social" },
    { icon: Zap, label: "Web", href: "/?tab=web" },
    { icon: FileUp, label: "Uploads", href: "/upload" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  const isActive = (href: string) => {
    if (!mounted) return false
    
    const currentTab = searchParams.get("tab")
    
    if (href === "/") {
      return pathname === "/" && (!currentTab || currentTab === "overview")
    }
    
    if (href === "/?tab=social") {
      return pathname === "/" && currentTab === "social"
    }
    
    if (href === "/?tab=web") {
      return pathname === "/" && currentTab === "web"
    }
    
    return pathname === href
  }

  return (
    <TooltipProvider delayDuration={300}>
      {navItems.map((item) => {
        const active = isActive(item.href)

        return (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-neutral-400 hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    active ? "text-primary-foreground" : "group-hover:text-foreground"
                  }`}
                />
                {isOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
              </Link>
            </TooltipTrigger>
            {/* ✅ Tooltip solo cuando está collapsed - pero siempre en el DOM */}
            <TooltipContent 
              side="right" 
              className="font-medium"
              style={{ display: isOpen ? 'none' : undefined }}
            >
              {item.label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </TooltipProvider>
  )
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col z-50 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Header con logo y toggle button */}
      <div className={`p-6 flex items-center ${isOpen ? "justify-between" : "justify-center"}`}>
        {isOpen && (
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CONDOR
            </h1>
            <p className="text-xs text-neutral-500 mt-1">Analytics</p>
          </div>
        )}
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-foreground"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side={isOpen ? "bottom" : "right"} 
              className="font-medium"
            >
              {isOpen ? "Collapse sidebar" : "Expand sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Navigation items */}
      <nav className="space-y-2 flex-1 px-3">
        <Suspense fallback={null}>
          <SidebarNav pathname={pathname} isOpen={isOpen} />
        </Suspense>
      </nav>

      {/* Profile button */}
      <div className="p-3 border-t border-border">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              {isOpen ? (
                <button className="w-full px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  Profile
                </button>
              ) : (
                <button className="w-full p-2 flex items-center justify-center bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity">
                  <span className="text-sm font-bold">A</span>
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              className="font-medium"
              style={{ display: isOpen ? 'none' : undefined }}
            >
              Profile
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  )
}