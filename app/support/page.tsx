/**
 * File: page.tsx
 * Path: /app/support/page.tsx
 * Last Modified: 2026-04-19
 * Layout fix: Removed max-w-screen-2xl from body sections entirely.
 *   Body uses px-8 lg:px-16 padding only — guaranteed full viewport width
 *   regardless of screen size. Same approach that makes the dashboard fill 100%.
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, BookOpen, ExternalLink, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const PLATFORM_GUIDES = [
  {
    platform: "LinkedIn Analytics",
    color: "#0a66c2",
    steps: [
      "Go to your LinkedIn Company Page.",
      "Click Analytics in the top navigation.",
      "Select Content, Followers, or Visitors.",
      "Set your date range.",
      "Click Export → Download as XLS.",
    ],
    note: "Export Content, Followers, and Visitors separately for the best CONDOR experience.",
    link: "https://www.linkedin.com/company/",
    linkLabel: "Open LinkedIn",
  },
  {
    platform: "X / Twitter Analytics",
    color: "#111111",
    steps: [
      "Go to analytics.twitter.com.",
      "Select the Tweets tab.",
      "Set your desired date range.",
      "Click Export data → Download CSV.",
    ],
    note: "The CSV export contains all tweet metrics for the selected period.",
    link: "https://analytics.twitter.com",
    linkLabel: "Open X Analytics",
  },
  {
    platform: "Google Analytics 4",
    color: "#e37400",
    steps: [
      "Go to your GA4 property.",
      "Open Reports → Engagement → Pages and screens.",
      "Click the Download icon (top right).",
      "Choose Download CSV.",
      "Upload the CSV to CONDOR under the Web tab.",
    ],
    note: "Use the date range selector in GA4 before exporting to control the period.",
    link: "https://analytics.google.com",
    linkLabel: "Open Google Analytics",
  },
]

const QUICK_ANSWERS = [
  {
    q: "My file is not being recognized. What should I do?",
    a: "Make sure you are uploading the original export from LinkedIn (XLS), X (CSV), or GA4 (CSV) without modifying it in Excel first. Saving in Excel can change the format and break parsing.",
  },
  {
    q: "Can I upload data from multiple accounts?",
    a: "Yes. Upload LinkedIn, X, and GA4 exports from different periods — they merge automatically. Use the date filter to control the view.",
  },
  {
    q: "My dashboard shows no data after upload.",
    a: "Refresh the page after upload. If the issue persists, go to Uploads and re-upload the file using the original platform export.",
  },
  {
    q: "How do I reset my data and start over?",
    a: "Click Clear Data in the dashboard toolbar. This removes all uploaded data from your session so you can upload fresh files.",
  },
  {
    q: "Can I export my charts as images?",
    a: "Yes. Most chart sections have a PNG or CSV download button. PDF export is available on the Flight plan and above.",
  },
  {
    q: "What does the Intelligent Recommendations section show?",
    a: "Data-driven suggestions based on your performance vs. industry benchmarks — best posting times, content types that work, and areas to improve.",
  },
]

export default function SupportPage() {
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
    <div className="min-h-screen w-full bg-background">

      {/* HEADER — border-b is full viewport width naturally */}
      <header className="border-b border-border bg-background">
        <div className="px-8 lg:px-16 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <img src="/condor-logo-v1.png" alt="CONDOR" width={24} height={24}
                className="object-contain" style={{ mixBlendMode: "multiply" }} />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-foreground"
              style={{ fontFamily: "var(--font-montserrat)" }}>CONDOR</span>
          </Link>

          {isLoggedIn === null ? null : isLoggedIn ? (
            <button onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </button>
          ) : (
            <Link href="/auth/login"
              className="text-sm text-neutral-500 hover:text-foreground transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* ALL BODY — w-full, no max-w, padding only */}
      <div className="w-full px-8 lg:px-16">

        {/* Hero */}
        <div className="pt-10 pb-8 border-b border-border">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
            Help &amp; Support
          </p>
          <h1 className="text-3xl font-bold text-foreground mb-2"
            style={{ fontFamily: "var(--font-montserrat)", letterSpacing: "-0.02em" }}>
            How can we help?
          </h1>
          <p className="text-sm text-neutral-500">Find answers below or reach out directly.</p>
        </div>

        {/* Contact banner */}
        <div className="py-6">
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(239,120,0,0.1)" }}>
                <Mail className="w-5 h-5" style={{ color: "#ef7800" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Email Support</p>
                <p className="text-xs text-neutral-500 mt-0.5">support@condoranalytics.app</p>
                <p className="text-xs text-neutral-500">Response within 1 business day</p>
              </div>
            </div>
            <a href="mailto:support@condoranalytics.app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white flex-shrink-0 hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #c44a00, #ef7800)" }}>
              <Mail className="w-4 h-4" />
              Contact us
            </a>
          </div>
        </div>

        {/* Two-column grid — full remaining width */}
        <div className="pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_440px] gap-10">

            {/* LEFT */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-4 h-4 text-neutral-400" />
                <h2 className="font-semibold text-foreground">
                  How to download your analytics files
                </h2>
              </div>
              <div className="space-y-6">
                {PLATFORM_GUIDES.map(guide => (
                  <div key={guide.platform}
                    className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: guide.color }} />
                      <h3 className="font-semibold text-sm text-foreground">{guide.platform}</h3>
                    </div>
                    <div className="px-5 py-4">
                      <ol className="space-y-2.5">
                        {guide.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                              style={{ background: guide.color, opacity: 0.85 }}>
                              {i + 1}
                            </span>
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                      {guide.note && (
                        <p className="mt-4 text-xs text-neutral-500 italic border-t border-border pt-3">
                          Note: {guide.note}
                        </p>
                      )}
                      <a href={guide.link} target="_blank" rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
                        style={{ color: guide.color }}>
                        {guide.linkLabel}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex-shrink-0">
              <div className="lg:sticky lg:top-6 space-y-6">
                <div>
                  <h2 className="font-semibold text-foreground mb-4">Quick answers</h2>
                  <div className="space-y-3">
                    {QUICK_ANSWERS.map((item, idx) => (
                      <div key={idx} className="rounded-xl border border-border bg-card p-4">
                        <p className="text-sm font-semibold text-foreground mb-1.5">{item.q}</p>
                        <p className="text-xs text-neutral-500 leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-sm font-semibold text-foreground mb-1">Need more features?</p>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                    Upgrade to Flight or Altitude for PDF reports, AI insights, more platforms, and team tools.
                  </p>
                  <Link href="/pricing"
                    className="w-full block text-center py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #c44a00, #ef7800)" }}>
                    See plans →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>{/* end w-full body */}

      <footer className="border-t border-border">
        <div className="px-8 lg:px-16 py-4 flex items-center justify-between"
          style={{ fontSize: "0.7rem", color: "#aaa" }}>
          <span>CONDOR Analytics © 2026 — All rights reserved</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}