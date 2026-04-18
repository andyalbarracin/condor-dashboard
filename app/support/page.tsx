/**
 * File: page.tsx
 * Path: /app/support/page.tsx
 * Last Modified: 2026-04-17
 * Description: CONDOR Support page.
 *   Content: platform download guides (LinkedIn, X, GA4), contact info, FAQ.
 *   Centered layout (max-w-3xl mx-auto). No 404.
 *   TODO: Replace mailto with verified support address before launch.
 *   TODO: Add live chat integration (Intercom / Crisp) for paid plans.
 */

import Link from "next/link"
import { Mail, ExternalLink, BookOpen } from "lucide-react"

const C = {
  orange: "#ef7800",
  carbon: "#212121",
  grey: "#818181",
  alabaster: "#e0e0e0",
  white: "#fdfdfd",
}

const PLATFORM_GUIDES = [
  {
    id: "linkedin",
    name: "LinkedIn Analytics",
    accent: "#0a66c2",
    steps: [
      "Go to your LinkedIn Company Page.",
      "Click Analytics in the top navigation.",
      "Select Content, Followers, or Visitors.",
      "Set your date range.",
      "Click Export → Download as XLS.",
    ],
    note: "Export Content, Followers, and Visitors separately for the best CONDOR experience.",
    url: "https://www.linkedin.com/company/",
    urlLabel: "Open LinkedIn →",
  },
  {
    id: "twitter",
    name: "X / Twitter Analytics",
    accent: "#374151",
    steps: [
      "Go to analytics.twitter.com.",
      "Select the Tweets tab.",
      "Set your desired date range.",
      "Click Export data → Download CSV.",
    ],
    note: "Export both the Tweets report and Account Overview for complete data.",
    url: "https://analytics.twitter.com",
    urlLabel: "Open X Analytics →",
  },
  {
    id: "ga4",
    name: "Google Analytics 4",
    accent: "#ef7800",
    steps: [
      "Go to analytics.google.com.",
      "Reports → Acquisition → Traffic acquisition.",
      "Set your date range at the top right.",
      "Share → Download file → Download CSV.",
    ],
    note: "Export with UTM source/medium data for the best results in CONDOR.",
    url: "https://analytics.google.com",
    urlLabel: "Open Google Analytics →",
  },
]

const FAQ = [
  { q: "How do I upload my analytics files?", a: "Go to the Upload section in the left sidebar (or click 'Upload File' from the dashboard toolbar). Select your exported file and CONDOR will parse and display it automatically." },
  { q: "What file formats does CONDOR support?", a: "CONDOR accepts XLS files from LinkedIn (Content, Followers, Visitors) and CSV files from Twitter/X and Google Analytics 4." },
  { q: "Why is my data not showing after upload?", a: "Make sure you're using the correct export file for each platform. LinkedIn exports should be XLS. If the issue persists, check that your file contains data for the selected date range." },
  { q: "How do I reset my password?", a: "On the sign in screen, click 'Forgot password?' and enter your email address. You'll receive a reset link within a few minutes." },
  { q: "How do I change my plan?", a: "Go to Settings → Billing (or visit /pricing) to upgrade, downgrade, or cancel your subscription at any time." },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen" style={{ background: C.white }}>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${C.alabaster}`, background: "#fff" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f3f3f3" }}>
              <img src="/condor-logo-v1.png" alt="" width={22} height={22} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
            </div>
            <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.18em", color: C.carbon }}>
              CONDOR
            </span>
          </Link>
          <Link href="/auth/login" className="text-sm font-medium transition-colors" style={{ color: C.grey }}>
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-12">

        {/* Page title — centered */}
        <div className="text-center mb-12">
          <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.grey, marginBottom: "0.6rem" }}>Help & Support</p>
          <h1 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "2rem", color: C.carbon, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            How can we help?
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.grey }}>
            Find answers below or reach out directly.
          </p>
        </div>

        {/* Contact card */}
        <div className="rounded-2xl border p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between"
          style={{ borderColor: C.alabaster, background: "#fff" }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.orange}12` }}>
              <Mail className="w-5 h-5" style={{ color: C.orange }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: C.carbon }}>Email Support</p>
              {/* TODO: Replace with verified support address before launch */}
              <p className="text-xs mt-0.5" style={{ color: C.grey }}>support@condoranalytics.app</p>
              <p className="text-xs mt-0.5" style={{ color: C.grey }}>Response within 1 business day</p>
            </div>
          </div>
          <a href="mailto:support@condoranalytics.app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, #c44a00, ${C.orange})` }}>
            <Mail className="w-4 h-4" />
            Contact us
          </a>
        </div>

        {/* Platform guides */}
        <div className="mb-12">
          <div className="flex items-center gap-2.5 mb-6">
            <BookOpen className="w-4 h-4" style={{ color: C.grey }} />
            <h2 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 600, fontSize: "1rem", color: C.carbon, letterSpacing: "-0.01em" }}>
              How to download your analytics files
            </h2>
          </div>
          <div className="space-y-4">
            {PLATFORM_GUIDES.map(p => (
              <div key={p.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.alabaster, borderLeftColor: p.accent, borderLeftWidth: "3px" }}>
                <div className="px-5 py-3 border-b" style={{ borderColor: C.alabaster, background: "#fff" }}>
                  <span className="font-semibold text-sm" style={{ color: C.carbon }}>{p.name}</span>
                </div>
                <div className="px-5 py-4 space-y-3" style={{ background: "#fafafa" }}>
                  <ol className="space-y-1.5">
                    {p.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: C.grey }}>
                        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                          style={{ background: `${p.accent}18`, color: p.accent }}>{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  {p.note && (
                    <p className="text-xs italic pt-2" style={{ color: C.grey, borderTop: `1px solid ${C.alabaster}` }}>
                      Note: {p.note}
                    </p>
                  )}
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: p.accent }}>
                    {p.urlLabel} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="mb-6" style={{ fontFamily: "var(--font-montserrat)", fontWeight: 600, fontSize: "1rem", color: C.carbon, letterSpacing: "-0.01em" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-0">
            {FAQ.map((item, i) => (
              <div key={i} className="py-5" style={{ borderBottom: `1px solid ${C.alabaster}` }}>
                <h3 className="font-semibold text-sm mb-2" style={{ color: C.carbon }}>{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.grey }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12" style={{ borderTop: `1px solid ${C.alabaster}` }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between" style={{ fontSize: "0.68rem", color: "#bbb" }}>
          <span>CONDOR Analytics © 2026 — All rights reserved</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-neutral-600 transition-colors">Terms of Use</Link>
            <span style={{ color: C.carbon, fontWeight: 600, fontSize: "0.68rem" }}>Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}