/**
 * File: page.tsx
 * Path: /app/pricing/page.tsx
 * Last Modified: 2026-04-17
 * Description: CONDOR pricing — "Plans" page.
 *   - NO emojis anywhere
 *   - Nest + Flight: active plans
 *   - Altitude + Apex: "Coming Soon" — visible but muted/disabled
 *   - Toggle: fixed-width container for discount badge (no shift)
 *   - Dark mode toggle: explicit colors for visibility
 *   - Full width layout with max-w-7xl
 *   - Responsive flex, mobile collapses features
 *   - Comparison table: improved contrast for light mode
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Minus, Zap, ArrowUpRight, Clock } from "lucide-react"

type FeatureValue = string | boolean | "coming_soon"

interface PlanFeature {
  category: string
  label: string
  nest: FeatureValue
  flight: FeatureValue
  altitude: FeatureValue
  apex: FeatureValue
}

// ================================================================
// PLAN CONFIG — No emojis, Altitude/Apex disabled
// ================================================================

const PLANS = [
  {
    id: "starter",
    name: "Nest",
    tagline: "Start with clarity",
    description: "For individual marketers who want to understand their data without complexity.",
    monthlyPrice: 19,
    annualPrice: 15,
    comingSoon: false,
    highlighted: false,
    accentColor: "#212121",
    borderStyle: "border-neutral-200 dark:border-neutral-700",
    bgStyle: "bg-white dark:bg-neutral-900",
    ctaStyle: { background: "#212121", color: "#fff" },
    highlights: [
      "1 project (workspace)",
      "LinkedIn + X analytics",
      "Overview, Social, Web dashboard",
      "Weekly & Traffic Summary modals",
      "Intelligent Recommendations",
      "PNG + CSV export",
    ],
  },
  {
    id: "professional",
    name: "Flight",
    tagline: "Reach new heights",
    description: "For serious marketers who need more platforms, history, and AI insights.",
    monthlyPrice: 49,
    annualPrice: 39,
    comingSoon: false,
    highlighted: true,
    badge: "Most Popular",
    accentColor: "#004898",
    borderStyle: "border-[#004898]",
    bgStyle: "bg-blue-50/60 dark:bg-blue-950/20",
    ctaStyle: { background: "#004898", color: "#fff" },
    highlights: [
      "3 projects + up to 5 platforms",
      "Instagram, TikTok + GA4",
      "Full data history",
      "AI Insights — 5 queries/month",
      "Top vs. Worst post analysis",
      "PDF export",
    ],
  },
  {
    id: "agency",
    name: "Altitude",
    tagline: "Scale your agency",
    description: "For agencies and teams managing multiple projects with full AI and automation.",
    monthlyPrice: 129,
    annualPrice: 99,
    comingSoon: true,
    highlighted: false,
    accentColor: "#818181",
    borderStyle: "border-neutral-200 dark:border-neutral-700",
    bgStyle: "bg-white dark:bg-neutral-900",
    ctaStyle: { background: "#e0e0e0", color: "#818181" },
    highlights: [
      "Unlimited projects",
      "Full AI — unlimited queries",
      "Advanced PDF reports",
      "Comparison dashboards",
      "API connections + auto sync",
      "Industry benchmarks + pattern detection",
    ],
  },
]

const COMPARISON_FEATURES: PlanFeature[] = [
  { category: "Projects & Data", label: "Projects (workspaces)", nest: "1", flight: "3", altitude: "Unlimited", apex: "Unlimited" },
  { category: "Projects & Data", label: "Platforms per project", nest: "2 (LinkedIn + X)", flight: "5", altitude: "Unlimited", apex: "Unlimited" },
  { category: "Projects & Data", label: "Data history", nest: "90 days", flight: "Unlimited", altitude: "Unlimited", apex: "Unlimited" },
  { category: "Projects & Data", label: "LinkedIn + X", nest: true, flight: true, altitude: true, apex: true },
  { category: "Projects & Data", label: "Instagram + TikTok", nest: false, flight: true, altitude: true, apex: true },
  { category: "Projects & Data", label: "Google Analytics 4 (CSV)", nest: true, flight: true, altitude: true, apex: true },
  { category: "Projects & Data", label: "GA4 direct (OAuth)", nest: false, flight: false, altitude: "coming_soon", apex: "coming_soon" },
  { category: "Dashboard & Reports", label: "Overview + Social + Web", nest: true, flight: true, altitude: true, apex: true },
  { category: "Dashboard & Reports", label: "Weekly & Traffic Summaries", nest: true, flight: true, altitude: true, apex: true },
  { category: "Dashboard & Reports", label: "Calendar heatmap", nest: true, flight: true, altitude: true, apex: true },
  { category: "Dashboard & Reports", label: "PNG + CSV export", nest: true, flight: true, altitude: true, apex: true },
  { category: "Dashboard & Reports", label: "PDF export", nest: false, flight: true, altitude: true, apex: true },
  { category: "Dashboard & Reports", label: "Advanced PDF reports", nest: false, flight: false, altitude: "coming_soon", apex: "coming_soon" },
  { category: "Dashboard & Reports", label: "Comparison dashboards", nest: false, flight: false, altitude: "coming_soon", apex: "coming_soon" },
  { category: "Dashboard & Reports", label: "Scheduled email reports", nest: false, flight: false, altitude: "coming_soon", apex: "coming_soon" },
  { category: "AI & Intelligence", label: "Rule-based Recommendations", nest: true, flight: true, altitude: true, apex: true },
  { category: "AI & Intelligence", label: "AI Insights", nest: false, flight: "5 / month", altitude: "coming_soon", apex: "coming_soon" },
  { category: "AI & Intelligence", label: "Top vs. Worst post analysis", nest: false, flight: "coming_soon", altitude: "coming_soon", apex: "coming_soon" },
  { category: "AI & Intelligence", label: "Industry benchmarks", nest: true, flight: true, altitude: "coming_soon", apex: "coming_soon" },
  { category: "Team & Collaboration", label: "Team members", nest: "1", flight: "1", altitude: "coming_soon", apex: "coming_soon" },
  { category: "Team & Collaboration", label: "Roles + permissions", nest: false, flight: false, altitude: "coming_soon", apex: "coming_soon" },
  { category: "Team & Collaboration", label: "White-label reports", nest: false, flight: false, altitude: false, apex: "coming_soon" },
]

// ================================================================
// FEATURE CELL
// ================================================================

function FeatureCell({ value, muted }: { value: FeatureValue; muted?: boolean }) {
  if (value === true) return <div className="flex justify-center"><Check className={`w-4 h-4 ${muted ? "text-neutral-300 dark:text-neutral-600" : "text-foreground"}`} /></div>
  if (value === false) return <div className="flex justify-center"><Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600" /></div>
  if (value === "coming_soon") return (
    <div className="flex justify-center">
      <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full">Soon</span>
    </div>
  )
  return (
    <div className="flex justify-center">
      <span className={`text-xs font-medium text-center ${muted ? "text-neutral-400 dark:text-neutral-600" : "text-foreground"}`}>{value}</span>
    </div>
  )
}

// ================================================================
// MAIN
// ================================================================

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null)

  const categories = Array.from(new Set(COMPARISON_FEATURES.map(f => f.category)))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: "#f3f3f3" }}>
            <img src="/condor-logo-v1.png" alt="" width={20} height={20} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
          </div>
          <span className="font-bold text-sm tracking-widest uppercase text-foreground">CONDOR</span>
          <span className="text-xs text-neutral-500">Analytics</span>
        </Link>
        <Link href="/auth/login" className="text-sm text-neutral-500 hover:text-foreground transition-colors">Sign in</Link>
      </header>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            30-day free trial · No credit card required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight" style={{ fontFamily: "var(--font-montserrat)" }}>
            Choose your altitude
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto">
            From your first insight to a full agency stack — CONDOR scales with you.
          </p>
        </div>

        {/* Toggle — fixed width container prevents shift */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-foreground" : "text-neutral-400"}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              style={{ background: isAnnual ? "#212121" : "#d1d5db" }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full transition-transform"
                style={{
                  transform: isAnnual ? "translateX(1.5rem)" : "translateX(0.25rem)",
                  /* Thumb always contrasts with track */
                  background: isAnnual ? "#ffffff" : "#ffffff",
                }}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-foreground" : "text-neutral-400"}`}>Annually</span>
            {/* Fixed width — prevents layout shift when badge appears/disappears */}
            <div style={{ minWidth: "90px" }}>
              {isAnnual && (
                <span className="text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Save ~20%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* === 3 PLAN CARDS === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {PLANS.map(plan => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
            return (
              <div key={plan.id}
                className={`relative rounded-2xl border-2 p-7 flex flex-col transition-all ${plan.borderStyle} ${plan.bgStyle} ${plan.comingSoon ? "opacity-60" : ""} ${plan.highlighted && !plan.comingSoon ? "shadow-lg" : ""}`}>

                {plan.badge && !plan.comingSoon && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#004898" }}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                {plan.comingSoon && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                      <Clock className="w-3 h-3" />
                      Coming Soon
                    </span>
                  </div>
                )}

                {/* Plan name — NO emoji */}
                <div className="mb-4">
                  <span className="font-bold text-xl" style={{ color: plan.comingSoon ? "#818181" : plan.accentColor }}>
                    {plan.name}
                  </span>
                  <p className="text-xs mt-0.5 text-neutral-500">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.comingSoon ? "text-neutral-400" : "text-foreground"}`}>${price}</span>
                    <span className="text-sm text-neutral-500">/month</span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-neutral-400 mt-0.5">Billed annually — ${plan.annualPrice * 12}/year</p>
                  )}
                </div>

                <p className="text-sm text-neutral-500 leading-relaxed mb-5">{plan.description}</p>

                {/* CTA */}
                {plan.comingSoon ? (
                  <div className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-center mb-6 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed select-none">
                    Coming Soon
                  </div>
                ) : (
                  <Link href={`/auth/sign-up?plan=${plan.id}&billing=${isAnnual ? "annual" : "monthly"}`}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-center transition-all mb-6 block hover:opacity-90"
                    style={plan.ctaStyle}>
                    Start free trial →
                  </Link>
                )}

                {/* Highlights */}
                <div className="space-y-2.5 flex-1">
                  {plan.highlights.map(h => (
                    <div key={h} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: plan.comingSoon ? "#818181" : plan.accentColor }} />
                      <span className="text-sm" style={{ color: plan.comingSoon ? "#818181" : undefined }}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* === APEX — Coming Soon (full width) === */}
        <div className="rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-7 mb-16 opacity-60">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-xl text-neutral-500">Apex</span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500">
                  <Clock className="w-3 h-3" />
                  Coming Soon
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">Enterprise</span>
              </div>
              <p className="text-sm text-neutral-400 max-w-xl leading-relaxed mb-4">
                Multi-user teams, white-label reports, advanced AI, and custom integrations. From $199/month.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Multi-user + roles", "White-label reports", "Full AI (advanced)", "Custom integrations", "Shared dashboards", "Performance prediction", "API access", "Priority SLA support"].map(f => (
                  <div key={f} className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="text-xs text-neutral-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <p className="text-2xl font-bold text-neutral-400">From $199</p>
              <p className="text-sm text-neutral-400">/ month · custom plans</p>
              <div className="px-6 py-3 rounded-xl font-semibold text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed select-none">
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* === COMPARISON TABLE === */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Full comparison</h2>
          <p className="text-neutral-500 text-sm text-center mb-8">Everything included in each plan</p>

          <div className="border border-border rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-5 border-b border-border bg-neutral-50 dark:bg-neutral-900">
              <div className="p-4 text-sm font-semibold text-neutral-500">Feature</div>
              {/* Nest */}
              <div className="p-4 text-center">
                <span className="text-sm font-bold text-foreground">Nest</span>
                <div className="text-xs font-bold text-neutral-500 mt-0.5">${isAnnual ? 15 : 19}/mo</div>
              </div>
              {/* Flight */}
              <div className="p-4 text-center" style={{ background: "rgba(0,72,152,0.04)" }}>
                <span className="text-sm font-bold" style={{ color: "#004898" }}>Flight</span>
                <div className="text-xs font-bold mt-0.5" style={{ color: "#004898" }}>${isAnnual ? 39 : 49}/mo</div>
              </div>
              {/* Altitude — muted */}
              <div className="p-4 text-center">
                <span className="text-sm font-bold text-neutral-400">Altitude</span>
                <div className="text-xs font-bold text-neutral-400 mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> Soon
                </div>
              </div>
              {/* Apex — muted */}
              <div className="p-4 text-center">
                <span className="text-sm font-bold text-neutral-400">Apex</span>
                <div className="text-xs font-bold text-neutral-400 mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> Soon
                </div>
              </div>
            </div>

            {categories.map(category => {
              const catFeatures = COMPARISON_FEATURES.filter(f => f.category === category)
              return (
                <div key={category}>
                  {/* Category row */}
                  <div className="grid grid-cols-5 border-b border-border bg-neutral-100/60 dark:bg-neutral-800/40">
                    <div className="col-span-5 px-4 py-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{category}</span>
                    </div>
                  </div>
                  {catFeatures.map((feature, idx) => (
                    <div key={feature.label}
                      className={`grid grid-cols-5 border-b border-border last:border-0 ${idx % 2 === 0 ? "bg-white dark:bg-neutral-900" : "bg-neutral-50/50 dark:bg-neutral-800/20"}`}>
                      <div className="p-3 px-4 text-sm text-neutral-700 dark:text-neutral-300 flex items-center">{feature.label}</div>
                      <div className="p-3 flex items-center justify-center"><FeatureCell value={feature.nest} /></div>
                      <div className="p-3 flex items-center justify-center" style={{ background: "rgba(0,72,152,0.03)" }}><FeatureCell value={feature.flight} /></div>
                      <div className="p-3 flex items-center justify-center"><FeatureCell value={feature.altitude} muted /></div>
                      <div className="p-3 flex items-center justify-center"><FeatureCell value={feature.apex} muted /></div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Trial callout */}
        <div className="text-center bg-card border border-border rounded-2xl p-10 mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>
            30 days free. No credit card. No risk.
          </h3>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto text-sm">
            Start with full Flight access and see what CONDOR can do before paying anything.
          </p>
          <Link href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #c44a00, #ef7800)" }}>
            Start Free Trial →
          </Link>
          <p className="text-xs text-neutral-400 mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline hover:text-foreground">Sign in here</Link>
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8" style={{ fontFamily: "var(--font-montserrat)" }}>FAQ</h3>
          <div className="space-y-6">
            {[
              { q: "Do I need a credit card for the trial?", a: "No. Sign up with your email or Google account and start immediately. No card required." },
              { q: "How does CONDOR work?", a: "CONDOR works with CSV/XLS files from LinkedIn, X, and Google Analytics. Download your export, upload it to CONDOR, and it interprets everything automatically. No API connections needed." },
              { q: "What's the difference between Nest and Flight?", a: "Nest covers one project with LinkedIn + X. Flight adds up to 3 projects, Instagram, TikTok, GA4, unlimited data history, and AI insights." },
              { q: "When will Altitude and Apex be available?", a: "We're building these plans now. Join the Flight plan trial and you'll be notified when Altitude and Apex launch." },
              { q: "Can I cancel anytime?", a: "Yes. Upgrade, downgrade, or cancel at any time. Cancellations take effect at the end of your billing period." },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-border pb-6">
                <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-xs text-neutral-400">
            © 2026 CONDOR Analytics · v2.0 ·{" "}
            <a href="mailto:hello@condoranalytics.app" className="hover:text-foreground">Contact</a>
          </p>
        </div>
      </div>
    </div>
  )
}