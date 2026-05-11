"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Kanban, Table2, Calendar, Lightbulb, BookMarked, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/content/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/content/table", label: "Table", icon: Table2 },
  { href: "/content/calendar", label: "Calendar", icon: Calendar },
  { href: "/content/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/content/templates", label: "Templates", icon: BookMarked },
]

interface ContentNavbarProps {
  onNewItem: () => void
}

export function ContentNavbar({ onNewItem }: ContentNavbarProps) {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between border-b border-border pb-3 mb-6">
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link key={href} href={href}>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-neutral-500 hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      <Button size="sm" onClick={onNewItem} className="gap-1.5">
        <Plus className="w-4 h-4" />
        New Content
      </Button>
    </div>
  )
}
