/**
 * File: page.tsx
 * Path: /app/pricing/page.tsx
 * Last Modified: 2026-04-18
 * Description: Layout fix — centered via max-w-screen-2xl mx-auto.
 *   Auth-aware header: back button if logged in, sign in if not.
 *   Collapsible FAQ accordion. No emojis.
 */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Minus, Zap, Clock, ChevronDown, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type FeatureValue = string | boolean | "coming_soon"

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
    borderClass: "border-neutral-200 dark:border-neutral-700",
    bgClass: "bg-white dark:bg-neutral-900",
    ctaStyle: { background: "#212121", color: "#fff" } as React.CSSProperties,
    checkColor: "#212121",
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
    borderClass: "border-[#004898]",
    bgClass: "bg-blue-50/60 dark:bg-blue-950/20",
    ctaStyle: { background: "#004898", color: "#fff" } as React.CSSProperties,
    checkColor: "#004898",
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
    borderClass: "border-neutral-200 dark:border-neutral-700",
    bgClass: "bg-white dark:bg-neutral-900",
    ctaStyle: { background: "#e0e0e0", color: "#818181" } as React.CSSProperties,
    checkColor: "#818181",
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

interface PlanFeature {
  category: string
  label: string
  nest: FeatureValue
  flight: FeatureValue
  altitude: FeatureValue
  apex: FeatureValue
}

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
  { category: "AI & Intelligence", label: "Rule-based Recommendations", nest: true, flight: true, altitude: true, apex: true },
  { category: "AI & Intelligence", label: "AI Insights", nest: false, flight: "5 / month", altitude: "coming_soon", apex: "coming_soon" },
  { category: "AI & Intelligence", label: "Industry benchmarks", nest: true, flight: true, altitude: "coming_soon", apex: "coming_soon" },
  { category: "Team & Collaboration", label: "Team members", nest: "1", flight: "1", altitude: "coming_soon", apex: "coming_soon" },
  { category: "Team & Collaboration", label: "Roles + permissions", nest: false, flight: false, altitude: "coming_soon", apex: "coming_soon" },
  { category: "Team & Collaboration", label: "White-label reports", nest: false, flight: false, altitude: false, apex: "coming_soon" },
]

function FeatureCell({ value, muted }: { value: FeatureValue; muted?: boolean }) {
  if (value === true) return <div className="flex justify-center"><Check className={`w-4 h-4 ${muted ? "text-neutral-300 dark:text-neutral-700" : "text-foreground"}`} /></div>
  if (value === false) return <div className="flex justify-center"><Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-700" /></div>
  if (value === "coming_soon") return <div className="flex justify-center"><span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full">Soon</span></div>
  return <div className="flex justify-center"><span className={`text-xs font-medium text-center ${muted ? "text-neutral-400 dark:text-neutral-600" : "text-foreground"}`}>{value}</span></div>
}

const FAQ_ITEMS = [
  { q: "Do I need a credit card for the trial?", a: "No. Sign up with your email or Google account and start immediately. No card required, no automatic charges at the end." },
  { q: "How does CONDOR work right now?", a: "Currently, CONDOR works by importing CSV and XLS files you export from LinkedIn, X/Twitter, and Google Analytics. Upload your export and CONDOR interprets, visualises, and benchmarks everything automatically. No API keys required. We are actively building direct API integrations — in future versions you will be able to connect your accounts and sync data automatically. Trial users will be notified when this launches." },
  { q: "Which platforms are supported today?", a: "LinkedIn (XLS export: Content, Followers, Visitors), X/Twitter (CSV from analytics.twitter.com), and Google Analytics 4 (CSV export). Instagram and TikTok are on the roadmap for the Flight plan." },
  { q: "What is the difference between Nest and Flight?", a: "Nest: 1 project, LinkedIn + X, 90-day history. Flight: 3 projects, adds Instagram, TikTok and GA4, unlimited history, AI Insights (5/month), and PDF export." },
  { q: "When will Altitude and Apex be available?", a: "We are building them now. Join the Flight trial and you will be notified by email when they launch. Your data and settings carry over." },
  { q: "Can I cancel anytime?", a: "Yes. Upgrade, downgrade, or cancel at any time from Settings. Cancellations take effect at the end of the current billing period." },
  { q: "What happens when my trial ends?", a: "Your account moves to read-only. Your data is preserved for 30 days before deletion. You will receive email reminders before this happens." },
  { q: "Is my data secure?", a: "Yes. Data is isolated per user with row-level security. All communication is HTTPS. We do not sell or share your analytics data with third parties. You retain ownership of everything you upload." },
  { q: "Can I switch between monthly and annual billing?", a: "Yes. Switch from monthly to annual at any time to save ~20%. Annual-to-monthly switches take effect at the end of your current annual period." },
  { q: "Do you offer refunds?", a: "We offer a full refund within 7 days of your first paid charge. Contact support@condoranalytics.app and we will process it within 2 business days." },
]

export default function PricingPage() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    check()
  }, [])

  const categories = Array.from(new Set(COMPARISON_FEATURES.map(f => f.category)))

  return (
    <div className="min-h-screen bg-background">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        {/* Full-width inner: max-w-screen-2xl centers on very large monitors */}
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
              <img src="/condor-logo-v1.png" alt="" width={20} height={20}
                style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-foreground"
              style={{ fontFamily: "var(--font-montserrat)" }}>CONDOR</span>
            <span className="text-xs text-neutral-500">Analytics</span>
          </Link>

          <div className="flex items-center gap-4">
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
        </div>
      </header>

      {/* ── PAGE BODY — centered, generous max-width ── */}
      <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 py-12">

        {/* Hero — centered */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            30-day free trial · No credit card required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-montserrat)" }}>
            Choose your altitude
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
            From your first insight to a full agency stack — CONDOR scales with you.
          </p>
        </div>

        {/* Billing toggle — centered */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-neutral-400"}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              style={{ background: isAnnual ? "#212121" : "#d1d5db" }}
            >
              <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                style={{ transform: isAnnual ? "translateX(1.5rem)" : "translateX(0.25rem)" }} />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-neutral-400"}`}>Annually</span>
            <div style={{ minWidth: "90px" }}>
              {isAnnual && (
                <span className="text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                  Save ~20%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── PLAN CARDS — 3 equal columns across full width ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PLANS.map(plan => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
            return (
              <div key={plan.id}
                className={`relative rounded-2xl border-2 p-7 flex flex-col ${plan.borderClass} ${plan.bgClass} ${plan.comingSoon ? "opacity-60" : ""} ${plan.highlighted && !plan.comingSoon ? "shadow-lg" : ""}`}>

                {plan.badge && !plan.comingSoon && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                      style={{ background: "#004898" }}>{plan.badge}</span>
                  </div>
                )}
                {plan.comingSoon && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500 whitespace-nowrap">
                      <Clock className="w-3 h-3" />Coming Soon
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <span className={`font-bold text-xl ${plan.comingSoon ? "text-neutral-400" : "text-foreground"}`}>{plan.name}</span>
                  <p className="text-xs mt-0.5 text-neutral-500">{plan.tagline}</p>
                </div>

                <div className="mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.comingSoon ? "text-neutral-400" : "text-foreground"}`}>${price}</span>
                    <span className="text-sm text-neutral-500">/month</span>
                  </div>
                  {isAnnual && <p className="text-xs text-neutral-400 mt-0.5">Billed annually — ${plan.annualPrice * 12}/year</p>}
                </div>

                <p className="text-sm text-neutral-500 leading-relaxed mb-5">{plan.description}</p>

                {plan.comingSoon ? (
                  <div className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-center mb-6 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed">
                    Coming Soon
                  </div>
                ) : (
                  <Link href={`/auth/sign-up?plan=${plan.id}&billing=${isAnnual ? "annual" : "monthly"}`}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-center block hover:opacity-90 transition-opacity mb-6"
                    style={plan.ctaStyle}>
                    Start free trial →
                  </Link>
                )}

                <div className="space-y-2.5 flex-1">
                  {plan.highlights.map(h => (
                    <div key={h} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: plan.checkColor }} />
                      <span className={`text-sm ${plan.comingSoon ? "text-neutral-400" : ""}`}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Apex */}
        <div className="rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 p-7 mb-14 opacity-60">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="font-bold text-xl text-neutral-500">Apex</span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500">
                  <Clock className="w-3 h-3" />Coming Soon
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">Enterprise</span>
              </div>
              <p className="text-sm text-neutral-400 max-w-xl leading-relaxed mb-4">Multi-user teams, white-label reports, advanced AI, and custom integrations. From $199/month.</p>
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
              <div className="px-6 py-3 rounded-xl font-semibold text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed">Coming Soon</div>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>Full comparison</h2>
          <p className="text-neutral-500 text-sm text-center mb-8">Everything included in each plan</p>
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-5 border-b border-border bg-neutral-50 dark:bg-neutral-900">
              <div className="p-4 text-sm font-semibold text-neutral-500">Feature</div>
              <div className="p-4 text-center"><span className="text-sm font-bold text-foreground">Nest</span><div className="text-xs font-bold text-neutral-500 mt-0.5">${isAnnual ? 15 : 19}/mo</div></div>
              <div className="p-4 text-center" style={{ background: "rgba(0,72,152,0.04)" }}><span className="text-sm font-bold" style={{ color: "#004898" }}>Flight</span><div className="text-xs font-bold mt-0.5" style={{ color: "#004898" }}>${isAnnual ? 39 : 49}/mo</div></div>
              <div className="p-4 text-center"><span className="text-sm font-bold text-neutral-400">Altitude</span><div className="text-xs text-neutral-400 mt-0.5 flex items-center justify-center gap-1"><Clock className="w-3 h-3" />Soon</div></div>
              <div className="p-4 text-center"><span className="text-sm font-bold text-neutral-400">Apex</span><div className="text-xs text-neutral-400 mt-0.5 flex items-center justify-center gap-1"><Clock className="w-3 h-3" />Soon</div></div>
            </div>
            {categories.map(category => {
              const catFeatures = COMPARISON_FEATURES.filter(f => f.category === category)
              return (
                <div key={category}>
                  <div className="grid grid-cols-5 border-b border-border bg-neutral-100/60 dark:bg-neutral-800/40">
                    <div className="col-span-5 px-4 py-2.5"><span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{category}</span></div>
                  </div>
                  {catFeatures.map((feature, idx) => (
                    <div key={feature.label} className={`grid grid-cols-5 border-b border-border last:border-0 ${idx % 2 === 0 ? "bg-white dark:bg-neutral-900" : "bg-neutral-50/50 dark:bg-neutral-800/20"}`}>
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
        <div className="text-center border border-border rounded-2xl p-10 mb-12 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-montserrat)" }}>
            30 days free. No credit card. No risk.
          </h3>
          <p className="text-neutral-500 mb-6 text-sm leading-relaxed">
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

        {/* FAQ — collapsible */}
        <div className="max-w-3xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8" style={{ fontFamily: "var(--font-montserrat)" }}>
            Frequently asked questions
          </h3>
          <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className={isOpen ? "bg-neutral-50 dark:bg-neutral-800/40" : "bg-background"}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <span className="font-semibold text-sm text-foreground pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center pt-6 border-t border-border">
          <p className="text-xs text-neutral-400">
            © 2026 CONDOR Analytics · v2.0 ·{" "}
            <a href="mailto:support@condoranalytics.app" className="hover:text-foreground transition-colors">Contact</a>
          </p>
        </div>
      </div>
    </div>
  )
}