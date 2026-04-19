/**
 * File: footer.tsx
 * Path: /components/layout/footer.tsx
 * Last Modified: 2026-04-18
 * Description: App footer. NO emojis. NO GitHub link. Support → /support page.
 */

import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border py-3 px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            CONDOR Analytics
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 text-xs">·</span>
          <span className="text-xs text-neutral-400">v2.0</span>
          <span className="text-neutral-300 dark:text-neutral-700 text-xs">·</span>
          <span className="text-xs text-neutral-400">© {currentYear}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-xs text-neutral-400 hover:text-foreground transition-colors"
          >
            Plans
          </Link>
          <Link
            href="/support"
            className="text-xs text-neutral-400 hover:text-foreground transition-colors"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  )
}