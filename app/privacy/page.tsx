/**
 * File: page.tsx
 * Path: /app/privacy/page.tsx
 * Last Modified: 2026-04-19
 * Fix: Auth-aware header. Same max-w-screen-2xl mx-auto layout as Pricing.
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const SECTIONS = [
  { id: "collect", title: "1. Information We Collect", body: "We collect information you provide directly (name, email, company details during signup and onboarding), analytics data you upload (LinkedIn, X, Google Analytics CSV/XLS files), and usage data (pages visited, features used, actions taken within the platform)." },
  { id: "use", title: "2. How We Use Your Information", body: "We use the information we collect to provide and improve the CONDOR Analytics service, to personalise your dashboard and benchmark recommendations, to send transactional emails (account creation, password reset, trial reminders), and to analyse aggregate usage patterns to improve the product." },
  { id: "storage", title: "3. Data Storage and Security", body: "Your data is stored securely with row-level access controls so only you can access your workspace. Analytics files are processed and stored in your personal workspace. We use HTTPS for all data transmission. Passwords are never stored in plain text." },
  { id: "sharing", title: "4. Data Sharing", body: "We do not sell, rent, or share your personal data with third parties for marketing purposes. We may share anonymised, aggregate usage statistics internally for product improvement." },
  { id: "uploads", title: "5. Analytics Data You Upload", body: "The CSV and XLS files you upload (LinkedIn, X, Google Analytics exports) remain your property. CONDOR processes them to generate insights and visualisations. This data is stored in your account and is not accessible to CONDOR staff except to resolve technical issues at your explicit request." },
  { id: "cookies", title: "6. Cookies", body: "CONDOR uses minimal cookies for session management and authentication. We do not use advertising cookies or third-party tracking pixels at this time." },
  { id: "rights", title: "7. Your Rights", body: "You have the right to access, correct, or delete your personal data at any time. You can update your profile information in Settings. To request account deletion and data removal, contact us at support@condoranalytics.app. We will process your request within 30 days." },
  { id: "retention", title: "8. Data Retention", body: "We retain your data for as long as your account is active. If you cancel your subscription, your data is preserved for 30 days before deletion. Analytics data you upload can be deleted at any time from the dashboard." },
  { id: "changes", title: "9. Changes to This Policy", body: "We may update this Privacy Policy from time to time. We will notify you of material changes via email or a notice in the platform. Continued use of CONDOR after changes constitutes acceptance of the updated policy." },
  { id: "contact", title: "10. Contact", body: "For privacy-related questions, contact us at privacy@condoranalytics.app or through our Support page." },
]

export default function PrivacyPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    check()
  }, [])

  return (
    <div className="min-h-screen bg-background">

      <header className="border-b border-border bg-background">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <img src="/condor-logo-v1.png" alt="CONDOR" width={24} height={24}
                className="object-contain" style={{ mixBlendMode: "multiply" }} />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-foreground"
              style={{ fontFamily: "var(--font-montserrat)" }}>CONDOR</span>
          </Link>

          {isLoggedIn === null ? null : isLoggedIn ? (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <Link href="/auth/login" className="text-sm text-neutral-500 hover:text-foreground transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-12">

          <aside className="lg:w-64 xl:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Legal</p>
              <h1 className="text-2xl font-bold text-foreground mb-1"
                style={{ fontFamily: "var(--font-montserrat)", letterSpacing: "-0.02em" }}>
                Privacy Policy
              </h1>
              <p className="text-xs text-neutral-500 mb-6">Last updated: April 17, 2026</p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-3 py-2.5 mb-6">
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  <span className="font-semibold">Draft.</span> Will be finalised before public launch.
                </p>
              </div>
              <nav className="hidden lg:block space-y-1">
                {SECTIONS.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                    className="block text-xs text-neutral-500 hover:text-foreground py-1 transition-colors leading-relaxed">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-10 max-w-prose">
              This Privacy Policy describes how CONDOR Analytics ("CONDOR", "we", "us") collects, uses, and protects
              information about users of our platform. By using CONDOR you agree to this policy.
            </p>
            <div className="space-y-10">
              {SECTIONS.map(section => (
                <div key={section.id} id={section.id} className="border-b border-border pb-10 last:border-0 scroll-mt-24">
                  <h2 className="mb-3 text-foreground"
                    style={{ fontFamily: "var(--font-montserrat)", fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.01em" }}>
                    {section.title}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </main>

        </div>
      </div>

      <footer className="border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 py-4 flex items-center justify-between"
          style={{ fontSize: "0.7rem", color: "#aaa" }}>
          <span>CONDOR Analytics © 2026 — All rights reserved</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}