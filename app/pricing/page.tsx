/**
 * File: page.tsx
 * Path: /app/pricing/page.tsx
 * Last Modified: 2026-04-16
 * Description: Pricing page con 3 planes + 30-day trial sin tarjeta de crédito.
 *              Sin free tier. Toggle mensual/anual. Diseño acorde al estilo CONDOR.
 *              Inspirada en la UI de pricing de referencia (3 columnas, toggle M/A).
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Minus, Zap, Star, Building2 } from "lucide-react"

// =============================================================
// TIPOS
// =============================================================

interface PlanFeature {
  label: string
  starter: string | boolean
  professional: string | boolean
  agency: string | boolean
}

// =============================================================
// DATOS DE PLANES
// =============================================================

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    description: "Para Marketing Managers que quieren saber qué contenido funciona.",
    monthlyPrice: 19,
    annualPrice: 15,
    cta: "Start Free Trial",
    ctaHref: "/auth/signup?plan=starter",
    color: "text-foreground",
    borderClass: "border-border",
    bgClass: "",
    highlighted: false,
  },
  {
    id: "professional",
    name: "Professional",
    icon: Star,
    description: "Para equipos que necesitan todas las plataformas, historial completo y AI insights.",
    monthlyPrice: 49,
    annualPrice: 39,
    cta: "Start Free Trial",
    ctaHref: "/auth/signup?plan=professional",
    color: "text-foreground",
    borderClass: "border-foreground",
    bgClass: "bg-foreground text-background",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "agency",
    name: "Agency",
    icon: Building2,
    description: "Para agencias con múltiples clientes que necesitan white-label y workspaces ilimitados.",
    monthlyPrice: 129,
    annualPrice: 99,
    cta: "Start Free Trial",
    ctaHref: "/auth/signup?plan=agency",
    color: "text-foreground",
    borderClass: "border-border",
    bgClass: "",
    highlighted: false,
  },
]

const FEATURES: PlanFeature[] = [
  {
    label: "Workspaces (empresas/marcas)",
    starter: "1",
    professional: "3",
    agency: "Unlimited",
  },
  {
    label: "Team members",
    starter: "1",
    professional: "3",
    agency: "Unlimited",
  },
  {
    label: "Data history",
    starter: "6 months",
    professional: "2 years",
    agency: "2 years",
  },
  {
    label: "LinkedIn Analytics",
    starter: true,
    professional: true,
    agency: true,
  },
  {
    label: "X / Twitter Analytics",
    starter: true,
    professional: true,
    agency: true,
  },
  {
    label: "Google Analytics 4 (CSV)",
    starter: true,
    professional: true,
    agency: true,
  },
  {
    label: "Instagram Analytics",
    starter: false,
    professional: true,
    agency: true,
  },
  {
    label: "TikTok Analytics",
    starter: false,
    professional: true,
    agency: true,
  },
  {
    label: "GA4 OAuth (real-time, no CSV)",
    starter: false,
    professional: true,
    agency: true,
  },
  {
    label: "Industry benchmarks",
    starter: true,
    professional: true,
    agency: true,
  },
  {
    label: "AI Content Insights",
    starter: false,
    professional: "50 / month",
    agency: "Unlimited",
  },
  {
    label: "Weekly & Traffic Summary",
    starter: true,
    professional: true,
    agency: true,
  },
  {
    label: "PDF & Excel export",
    starter: true,
    professional: true,
    agency: true,
  },
  {
    label: "Scheduled email reports",
    starter: false,
    professional: true,
    agency: true,
  },
  {
    label: "Competitor benchmarking",
    starter: false,
    professional: "3 competitors",
    agency: "Unlimited",
  },
  {
    label: "White-label reports",
    starter: false,
    professional: false,
    agency: true,
  },
  {
    label: "API access",
    starter: false,
    professional: false,
    agency: true,
  },
  {
    label: "Priority support",
    starter: false,
    professional: true,
    agency: true,
  },
  {
    label: "Onboarding 1:1",
    starter: false,
    professional: false,
    agency: true,
  },
]

// =============================================================
// HELPERS
// =============================================================

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="w-4 h-4 text-foreground mx-auto" />
  }
  if (value === false) {
    return <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />
  }
  return (
    <span className="text-sm font-medium text-foreground">{value}</span>
  )
}

// =============================================================
// COMPONENTE PRINCIPAL
// =============================================================

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      {/* Header minimal */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CONDOR
          </span>
          <span className="text-xs text-neutral-500 mt-0.5">Analytics</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm text-neutral-500 hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* === HERO === */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            30-day free trial · No credit card required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Choose The Plan That's
            <br />
            <span className="text-foreground">Right For Your Team</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto">
            CONDOR analytics for B2B companies. Start your trial today —
            upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        {/* === TOGGLE MENSUAL/ANUAL === */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium transition-colors ${
              !isAnnual ? "text-foreground" : "text-neutral-400"
            }`}
          >
            Monthly
          </span>

          {/* Toggle switch */}
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isAnnual ? "bg-foreground" : "bg-neutral-300 dark:bg-neutral-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium transition-colors ${
                isAnnual ? "text-foreground" : "text-neutral-400"
              }`}
            >
              Annually
            </span>
            {isAnnual && (
              <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* === CARDS DE PLANES === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
            const annualTotal = plan.annualPrice * 12

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 flex flex-col ${plan.borderClass} ${
                  plan.highlighted ? "shadow-2xl scale-105" : "shadow-sm"
                }`}
              >
                {/* Badge "Most Popular" */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-foreground text-background text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        plan.highlighted
                          ? "bg-background/20"
                          : "bg-neutral-100 dark:bg-neutral-800"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          plan.highlighted
                            ? "text-background"
                            : "text-foreground"
                        }`}
                      />
                    </div>
                    <span
                      className={`font-semibold text-lg ${
                        plan.highlighted ? "text-background" : "text-foreground"
                      }`}
                    >
                      {plan.name}
                    </span>
                  </div>

                  {/* Precio */}
                  <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-4xl font-bold ${
                          plan.highlighted ? "text-background" : "text-foreground"
                        }`}
                      >
                        ${price}
                      </span>
                      <span
                        className={`text-sm ${
                          plan.highlighted
                            ? "text-background/70"
                            : "text-neutral-500"
                        }`}
                      >
                        /month
                      </span>
                    </div>
                    {isAnnual && (
                      <p
                        className={`text-xs mt-1 ${
                          plan.highlighted
                            ? "text-background/60"
                            : "text-neutral-400"
                        }`}
                      >
                        Billed annually (${annualTotal}/year)
                      </p>
                    )}
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      plan.highlighted ? "text-background/80" : "text-neutral-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={`${plan.ctaHref}&billing=${isAnnual ? "annual" : "monthly"}`}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-center transition-all mb-6 ${
                    plan.highlighted
                      ? "bg-background text-foreground hover:bg-neutral-100"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {plan.cta} →
                </Link>

                {/* Features del plan (top 5 visible) */}
                <div className="space-y-3">
                  {FEATURES.slice(0, 8).map((feature) => {
                    const value =
                      plan.id === "starter"
                        ? feature.starter
                        : plan.id === "professional"
                        ? feature.professional
                        : feature.agency

                    if (value === false) return null

                    return (
                      <div key={feature.label} className="flex items-center gap-3">
                        <div
                          className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                            plan.highlighted
                              ? "bg-background/20"
                              : "bg-primary/10"
                          }`}
                        >
                          <Check
                            className={`w-2.5 h-2.5 ${
                              plan.highlighted ? "text-background" : "text-primary"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm ${
                            plan.highlighted
                              ? "text-background/90"
                              : "text-neutral-600 dark:text-neutral-300"
                          }`}
                        >
                          {typeof value === "string" ? value : feature.label}
                          {typeof value === "boolean" && value && ` ${feature.label}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* === TABLA COMPARATIVA COMPLETA === */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Full Feature Comparison
          </h2>
          <p className="text-neutral-500 text-center text-sm mb-8">
            Everything included in each plan
          </p>

          <div className="border border-border rounded-2xl overflow-hidden">
            {/* Header de la tabla */}
            <div className="grid grid-cols-4 bg-card border-b border-border">
              <div className="p-4 text-sm font-semibold text-neutral-400">
                Feature
              </div>
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 text-center ${
                    plan.highlighted ? "bg-foreground" : ""
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${
                      plan.highlighted ? "text-background" : "text-foreground"
                    }`}
                  >
                    {plan.name}
                  </span>
                  <div
                    className={`text-lg font-bold mt-0.5 ${
                      plan.highlighted ? "text-background" : "text-foreground"
                    }`}
                  >
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    <span
                      className={`text-xs font-normal ml-1 ${
                        plan.highlighted ? "text-background/70" : "text-neutral-500"
                      }`}
                    >
                      /mo
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Filas de features */}
            {FEATURES.map((feature, idx) => (
              <div
                key={feature.label}
                className={`grid grid-cols-4 border-b border-border last:border-0 ${
                  idx % 2 === 0
                    ? "bg-neutral-50/50 dark:bg-neutral-900/20"
                    : "bg-card"
                }`}
              >
                <div className="p-4 text-sm text-neutral-600 dark:text-neutral-300 flex items-center">
                  {feature.label}
                </div>
                {[feature.starter, feature.professional, feature.agency].map(
                  (value, i) => (
                    <div
                      key={i}
                      className={`p-4 flex items-center justify-center ${
                        PLANS[i].highlighted ? "bg-foreground/5 dark:bg-foreground/10" : ""
                      }`}
                    >
                      <FeatureValue value={value} />
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* === TRIAL CALLOUT === */}
        <div className="text-center bg-card border border-border rounded-2xl p-10 mb-12">
          <div className="text-4xl mb-3">🦅</div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            30 days free. No credit card. No risk.
          </h3>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            Start your trial with access to the Professional plan. Downgrade,
            upgrade, or cancel anytime. We'll remind you before the trial ends.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-foreground text-background rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-accent transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="text-xs text-neutral-400 mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline hover:text-foreground">
              Sign in here
            </Link>
          </p>
        </div>

        {/* === FAQs === */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            {[
              {
                q: "Do I need a credit card to start the trial?",
                a: "No. You can start your 30-day trial with just an email address. No credit card required until you decide to subscribe.",
              },
              {
                q: "What happens when the trial ends?",
                a: "You'll receive an email reminder 7 days and 1 day before your trial expires. After 30 days, your account will be paused until you choose a plan. Your data is preserved for 30 additional days.",
              },
              {
                q: "Can I upload data from LinkedIn and GA4?",
                a: "Yes. CONDOR works with CSV/XLS exports from LinkedIn (Content, Followers, Visitors), X/Twitter, and Google Analytics 4. No API access required — just download your exports and upload them.",
              },
              {
                q: "Can I change plans?",
                a: "Absolutely. You can upgrade or downgrade at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the next billing cycle.",
              },
              {
                q: "Is there a free plan?",
                a: "We don't offer a permanent free plan — CONDOR is built for professional use and we want to provide real support and value to every user. The 30-day trial gives you full Professional access to evaluate the product.",
              },
              {
                q: "What's the difference between the Starter and Professional plans?",
                a: "Starter covers LinkedIn, X/Twitter, and GA4 with 6 months of data history — perfect for a single Marketing Manager. Professional adds Instagram, TikTok, real-time GA4 via OAuth, AI insights, 2 years of history, and supports 3 team members.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-border pb-6">
                <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer minimal */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-xs text-neutral-400">
            © 2026 CONDOR Analytics · Built for B2B Marketing Managers ·{" "}
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}