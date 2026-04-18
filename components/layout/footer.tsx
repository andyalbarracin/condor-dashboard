/**
 * File: footer.tsx
 * Path: /components/layout/footer.tsx
 * Last Modified: 2026-04-16
 * Description: App footer shown at the bottom of every dashboard page.
 *              Displays CONDOR version (v2.0), copyright, and quick links.
 *              Version shown publicly is "2.0" per product decision.
 */

import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border py-3 px-8">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand + version */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            🦅 CONDOR Analytics
          </span>
          <span className="text-neutral-300 dark:text-neutral-700 text-xs">·</span>
          <span className="text-xs text-neutral-400">v2.0</span>
          <span className="text-neutral-300 dark:text-neutral-700 text-xs">·</span>
          <span className="text-xs text-neutral-400">© {currentYear}</span>
        </div>

        {/* Right: Quick links */}
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-xs text-neutral-400 hover:text-foreground transition-colors"
          >
            Plans
          </Link>
          <a
            href="mailto:support@condoranalytics.app"
            className="text-xs text-neutral-400 hover:text-foreground transition-colors"
          >
            Support
          </a>
          <a
            href="https://github.com/andyalbarracin/condor-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}