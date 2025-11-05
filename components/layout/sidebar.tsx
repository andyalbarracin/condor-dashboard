"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, BarChart3, Settings, FileUp, Zap, Menu, X } from "lucide-react"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: BarChart3, label: "Social", href: "/?tab=social" },
    { icon: Zap, label: "Web", href: "/?tab=web" },
    { icon: FileUp, label: "Uploads", href: "/upload" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col z-50 ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        <div className={`p-6 flex items-center ${isOpen ? "justify-between" : "justify-center"}`}>
          {isOpen && (
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CONDOR
              </h1>
              <p className="text-xs text-neutral-500 mt-1">Analytics</p>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="space-y-2 flex-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground transition-all duration-200 group"
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 group-hover:text-primary transition-colors flex-shrink-0" />
              {isOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          {isOpen && (
            <button className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Profile
            </button>
          )}
        </div>
      </aside>

      {/* Spacer for collapsed sidebar */}
      <div className={`transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`} />
    </>
  )
}
