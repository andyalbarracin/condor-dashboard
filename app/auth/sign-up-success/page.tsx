/**
 * File: page.tsx
 * Path: /app/onboarding/page.tsx
 * Last Modified: 2026-04-17
 * Description: Multi-step onboarding for new CONDOR users.
 *              Redesigned: professional header, clean step transitions,
 *              left sidebar with step list on desktop (elegant two-column layout).
 *              5 steps: Personal → Company → Goals → Project → Get data.
 *              Saves to Supabase on each step — resumable if interrupted.
 *              Aligned with CONDOR Manifesto: clarity, directness, professionalism.
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ChevronRight, ArrowLeft, ExternalLink, Upload, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ================================================================
// TYPES
// ================================================================

interface OnboardingData {
  full_name: string
  job_title: string
  country: string
  company_name: string
  industry: string
  company_size: string
  website_url: string
  goals: string[]
  posting_frequency: string
  current_tools: string[]
  workspace_name: string
  referral_source: string
  acquisition_detail: string
}

const TOTAL_STEPS = 5

// ================================================================
// DATA
// ================================================================

const JOB_TITLES = [
  "Marketing Manager",
  "Content Manager",
  "Social Media Manager",
  "Digital Marketing Specialist",
  "Marketing Director",
  "Business Owner",
  "Agency Owner / Director",
  "Freelancer",
  "Other",
]

const LATAM_COUNTRIES = ["Argentina","Chile","Colombia","Uruguay","México","Brasil","Perú","Venezuela","Bolivia","Paraguay","Ecuador"]
const OTHER_COUNTRIES = ["España","United States","United Kingdom","Canada","Australia","Other"]
const ALL_COUNTRIES = [...LATAM_COUNTRIES, "—", ...OTHER_COUNTRIES]

const INDUSTRIES = [
  "Telecom / Network Infrastructure","SaaS / Software","B2B Technology",
  "Fintech / Financial Services","E-commerce / Retail","Healthcare",
  "Education","Media / Publishing","Marketing Agency","Consulting",
  "Manufacturing","Real Estate","Other",
]

const COMPANY_SIZES = [
  { value: "1-10", label: "1–10", sub: "Just me or a small team" },
  { value: "11-50", label: "11–50", sub: "Small company" },
  { value: "51-200", label: "51–200", sub: "Mid-size company" },
  { value: "201-500", label: "201–500", sub: "Growing company" },
  { value: "500+", label: "500+", sub: "Large organization" },
]

const GOALS = [
  { id: "know_what_works", label: "Know which content actually works", sub: "Stop guessing — see what drives real results." },
  { id: "justify_investment", label: "Justify social media investment", sub: "Show leadership ROI backed by data." },
  { id: "save_time_reporting", label: "Spend less time on reports", sub: "From 4 hours to 15 minutes every month." },
  { id: "understand_audience", label: "Understand my audience better", sub: "Who's engaging, and why." },
  { id: "benchmark_industry", label: "Compare against industry benchmarks", sub: "Know if you're above average, and by how much." },
  { id: "plan_smarter", label: "Plan a smarter content calendar", sub: "Post at the right time, in the right format." },
]

const POSTING_FREQUENCIES = [
  { value: "daily", label: "Every day" },
  { value: "2-3x_week", label: "2–3 times per week" },
  { value: "1x_week", label: "Once a week" },
  { value: "less_than_weekly", label: "Less than once a week" },
  { value: "not_sure", label: "I'm figuring it out" },
]

const CURRENT_TOOLS = [
  { id: "native", label: "Native analytics (LinkedIn, X, GA4)" },
  { id: "hootsuite", label: "Hootsuite" },
  { id: "sprout", label: "Sprout Social" },
  { id: "buffer", label: "Buffer" },
  { id: "metricool", label: "Metricool" },
  { id: "excel_sheets", label: "Excel / Google Sheets" },
  { id: "none", label: "Nothing yet" },
]

const REFERRAL_SOURCES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "google_search", label: "Google search" },
  { value: "word_of_mouth", label: "A colleague or friend" },
  { value: "twitter_x", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "agency", label: "Through an agency" },
  { value: "other", label: "Somewhere else" },
]

const PLATFORM_GUIDES = [
  {
    id: "linkedin", name: "LinkedIn Analytics",
    accent: "#0a66c2",
    steps: [
      "Go to your LinkedIn Company Page",
      "Click Analytics in the top navigation",
      "Select Content, Followers, or Visitors",
      "Set your desired date range",
      "Click Export and download as CSV or XLS",
    ],
    url: "https://www.linkedin.com/company/",
    urlLabel: "Open LinkedIn →",
    note: "Export Content, Followers, and Visitors separately for the best experience in CONDOR.",
  },
  {
    id: "twitter", name: "X / Twitter Analytics",
    accent: "#1da1f2",
    steps: [
      "Go to analytics.twitter.com",
      "Select the Tweets tab",
      "Set your date range",
      "Click Export data",
      "Download the CSV file",
    ],
    url: "https://analytics.twitter.com",
    urlLabel: "Open X Analytics →",
    note: "Export both the Tweets report and Account Overview for complete data.",
  },
  {
    id: "ga4", name: "Google Analytics 4",
    accent: "#e37400",
    steps: [
      "Go to analytics.google.com",
      "Open Reports → Acquisition → Traffic acquisition",
      "Set your date range at the top right",
      "Click Share this report → Download file → Download CSV",
    ],
    url: "https://analytics.google.com",
    urlLabel: "Open Google Analytics →",
    note: "Export the session source/medium report with UTM data for the best results.",
  },
]

const STEP_CONFIG = [
  { title: "About you", subtitle: "Tell us a bit about yourself so we can personalize your experience." },
  { title: "Your company", subtitle: "This helps us find the right industry benchmarks for you." },
  { title: "Your goals", subtitle: "We use this to prioritize what you see from day one." },
  { title: "Your first project", subtitle: "A project organizes all your data in one place." },
  { title: "Connect your data", subtitle: "Here's how to get your first analytics files." },
]

// ================================================================
// SELECT COMPONENT — reusable
// ================================================================

function Select({ id, value, onChange, options, placeholder, disabled }: {
  id: string
  value: string
  onChange: (v: string) => void
  options: (string | { value: string; label: string })[]
  placeholder: string
  disabled?: boolean
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full h-10 px-3 border border-border rounded-xl bg-card text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => {
        if (typeof opt === "string") {
          if (opt === "—") return <option key="sep" disabled value="">──────────────</option>
          return <option key={opt} value={opt}>{opt}</option>
        }
        return <option key={opt.value} value={opt.value}>{opt.label}</option>
      })}
    </select>
  )
}

// ================================================================
// STEP 1 — Personal
// ================================================================

function StepPersonal({ data, onChange }: { data: OnboardingData; onChange: (u: Partial<OnboardingData>) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" placeholder="Alex Smith" value={data.full_name} onChange={(e) => onChange({ full_name: e.target.value })} autoFocus className="h-10 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="job_title">Role</Label>
        <Select id="job_title" value={data.job_title} onChange={(v) => onChange({ job_title: v })} options={JOB_TITLES} placeholder="Select your role…" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="country">Country</Label>
        <Select id="country" value={data.country} onChange={(v) => onChange({ country: v })} options={ALL_COUNTRIES} placeholder="Select country…" />
      </div>
    </div>
  )
}

// ================================================================
// STEP 2 — Company
// ================================================================

function StepCompany({ data, onChange }: { data: OnboardingData; onChange: (u: Partial<OnboardingData>) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="company_name">Company name</Label>
        <Input id="company_name" placeholder="Asentria" value={data.company_name} onChange={(e) => onChange({ company_name: e.target.value })} autoFocus className="h-10 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="industry">Industry</Label>
        <Select id="industry" value={data.industry} onChange={(v) => onChange({ industry: v })} options={INDUSTRIES} placeholder="Select industry…" />
      </div>
      <div className="space-y-2">
        <Label>Company size</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COMPANY_SIZES.map((size) => (
            <button
              key={size.value} type="button" onClick={() => onChange({ company_size: size.value })}
              className={`rounded-xl border-2 p-3 text-left transition-all ${data.company_size === size.value ? "border-foreground bg-foreground/5" : "border-border hover:border-neutral-300 dark:hover:border-neutral-600"}`}
            >
              <div className="font-semibold text-sm text-foreground">{size.label}</div>
              <div className="text-xs text-neutral-500 mt-0.5">{size.sub}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="website_url">Website <span className="text-neutral-400 font-normal">(optional)</span></Label>
        <Input id="website_url" type="url" placeholder="https://company.com" value={data.website_url} onChange={(e) => onChange({ website_url: e.target.value })} className="h-10 rounded-xl" />
      </div>
    </div>
  )
}

// ================================================================
// STEP 3 — Goals
// ================================================================

function StepGoals({ data, onChange }: { data: OnboardingData; onChange: (u: Partial<OnboardingData>) => void }) {
  const toggleGoal = (id: string) => onChange({ goals: data.goals.includes(id) ? data.goals.filter(g => g !== id) : [...data.goals, id] })
  const toggleTool = (id: string) => onChange({ current_tools: data.current_tools.includes(id) ? data.current_tools.filter(t => t !== id) : [...data.current_tools, id] })

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Primary goals <span className="text-neutral-400 font-normal text-xs">(select all that apply)</span></Label>
        <div className="space-y-2">
          {GOALS.map((goal) => {
            const selected = data.goals.includes(goal.id)
            return (
              <button key={goal.id} type="button" onClick={() => toggleGoal(goal.id)}
                className={`w-full flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all ${selected ? "border-foreground bg-foreground/5" : "border-border hover:border-neutral-300 dark:hover:border-neutral-600"}`}
              >
                <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all ${selected ? "border-foreground bg-foreground" : "border-neutral-300 dark:border-neutral-600"}`}>
                  {selected && <svg className="w-2.5 h-2.5 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{goal.label}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{goal.sub}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Publishing frequency</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {POSTING_FREQUENCIES.map((freq) => (
            <button key={freq.value} type="button" onClick={() => onChange({ posting_frequency: freq.value })}
              className={`rounded-xl border-2 px-3 py-2.5 text-sm text-left transition-all font-medium ${data.posting_frequency === freq.value ? "border-foreground bg-foreground/5 text-foreground" : "border-border text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"}`}
            >
              {freq.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Current analytics tools <span className="text-neutral-400 font-normal text-xs">(select all that apply)</span></Label>
        <div className="grid grid-cols-2 gap-2">
          {CURRENT_TOOLS.map((tool) => {
            const selected = data.current_tools.includes(tool.id)
            return (
              <button key={tool.id} type="button" onClick={() => toggleTool(tool.id)}
                className={`flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 text-sm text-left transition-all ${selected ? "border-foreground bg-foreground/5 font-medium text-foreground" : "border-border text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"}`}
              >
                <span>{tool.label}</span>
                {selected && <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ================================================================
// STEP 4 — Workspace
// ================================================================

function StepWorkspace({ data, onChange }: { data: OnboardingData; onChange: (u: Partial<OnboardingData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="workspace_name">Project name</Label>
        <p className="text-xs text-neutral-500">Groups all your analytics data in one place. You can create more projects later.</p>
        <Input id="workspace_name" placeholder={data.company_name || "My Company"} value={data.workspace_name} onChange={(e) => onChange({ workspace_name: e.target.value })} autoFocus className="h-10 rounded-xl" />
      </div>

      <div className="space-y-2">
        <Label>How did you hear about CONDOR?</Label>
        <div className="grid grid-cols-2 gap-2">
          {REFERRAL_SOURCES.map((source) => (
            <button key={source.value} type="button" onClick={() => onChange({ referral_source: source.value })}
              className={`rounded-xl border-2 px-3 py-2 text-sm text-left transition-all font-medium ${data.referral_source === source.value ? "border-foreground bg-foreground/5 text-foreground" : "border-border text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"}`}
            >
              {source.label}
            </button>
          ))}
        </div>
      </div>

      {data.referral_source && (
        <div className="space-y-1.5">
          <Label htmlFor="acquisition_detail">Any more details? <span className="text-neutral-400 font-normal">(optional)</span></Label>
          <Input id="acquisition_detail" placeholder="e.g. A specific post, name of a colleague…" value={data.acquisition_detail} onChange={(e) => onChange({ acquisition_detail: e.target.value })} className="h-10 rounded-xl" />
        </div>
      )}
    </div>
  )
}

// ================================================================
// STEP 5 — Get data
// ================================================================

function StepGetData({ onFinish }: { onFinish: (goToUpload: boolean) => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          CONDOR works with files that LinkedIn, X, and Google Analytics let you download.
          No API access, no account connection needed —{" "}
          <span className="font-semibold text-foreground">download a file, upload it, and CONDOR does the rest.</span>
        </p>
      </div>

      <div className="space-y-4">
        {PLATFORM_GUIDES.map((platform) => (
          <div key={platform.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2" style={{ borderLeftColor: platform.accent, borderLeftWidth: "3px" }}>
              <span className="font-semibold text-sm text-foreground">{platform.name}</span>
            </div>
            <div className="px-4 py-3 space-y-3">
              <ol className="space-y-1.5">
                {platform.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ background: `${platform.accent}20`, color: platform.accent }}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              {platform.note && (
                <p className="text-xs text-neutral-500 italic border-t border-border pt-2">
                  Note: {platform.note}
                </p>
              )}
              <a href={platform.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline underline-offset-4" style={{ color: platform.accent }}
              >
                {platform.urlLabel}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 pt-2">
        <Button onClick={() => onFinish(true)} className="w-full h-11 gap-2 rounded-xl font-semibold">
          <Upload className="w-4 h-4" />
          I have my files — take me to upload
        </Button>
        <Button variant="outline" onClick={() => onFinish(false)} className="w-full h-11 rounded-xl">
          Go to dashboard first
        </Button>
      </div>
      <p className="text-center text-xs text-neutral-400">
        You can upload files at any time from the dashboard.
      </p>
    </div>
  )
}

// ================================================================
// MAIN ONBOARDING PAGE
// ================================================================

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<OnboardingData>({
    full_name: "", job_title: "", country: "",
    company_name: "", industry: "", company_size: "", website_url: "",
    goals: [], posting_frequency: "", current_tools: [],
    workspace_name: "", referral_source: "", acquisition_detail: "",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return }
      const name = user.user_metadata?.full_name || user.user_metadata?.name || ""
      setData((prev) => ({ ...prev, full_name: prev.full_name || name }))
    })
  }, [router])

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => {
      const updated = { ...prev, ...updates }
      if (updates.company_name && !prev.workspace_name) updated.workspace_name = updates.company_name
      return updated
    })
  }

  const validateStep = (): string | null => {
    if (currentStep === 1) {
      if (!data.full_name.trim()) return "Please enter your name."
      if (!data.job_title) return "Please select your role."
      if (!data.country) return "Please select your country."
    }
    if (currentStep === 2) {
      if (!data.company_name.trim()) return "Please enter your company name."
      if (!data.industry) return "Please select your industry."
      if (!data.company_size) return "Please select your company size."
    }
    if (currentStep === 3) {
      if (data.goals.length === 0) return "Select at least one goal."
      if (!data.posting_frequency) return "Please select how often you post."
    }
    if (currentStep === 4) {
      if (!data.workspace_name.trim()) return "Please enter a project name."
    }
    return null
  }

  const saveStepToSupabase = async (step: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (step === 1) await supabase.from("profiles").update({ full_name: data.full_name, job_title: data.job_title, country: data.country, onboarding_step: 1 }).eq("id", user.id)
    if (step === 2) await supabase.from("profiles").update({ company_name: data.company_name, industry: data.industry, company_size: data.company_size, website_url: data.website_url || null, onboarding_step: 2 }).eq("id", user.id)
    if (step === 3) await supabase.from("profiles").update({ posting_frequency: data.posting_frequency, onboarding_step: 3 }).eq("id", user.id)
    if (step === 4) {
      const { error: wsError } = await supabase.from("workspaces").insert({ owner_id: user.id, name: data.workspace_name, industry: data.industry || null, website_url: data.website_url || null })
      if (wsError && !wsError.message.includes("duplicate")) throw wsError
      await supabase.from("profiles").update({ referral_source: data.referral_source || null, onboarding_step: 4 }).eq("id", user.id)
      await supabase.from("onboarding_responses").upsert({ user_id: user.id, goals: data.goals, acquisition_detail: data.acquisition_detail || null, current_tools: data.current_tools })
    }
  }

  const handleNext = async () => {
    setError(null)
    const validationError = validateStep()
    if (validationError) { setError(validationError); return }
    setIsSaving(true)
    try {
      await saveStepToSupabase(currentStep)
      setCurrentStep((prev) => prev + 1)
    } catch (err) {
      console.error("[Onboarding] Save error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinish = async (goToUpload = false) => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from("profiles").update({ onboarding_completed: true, onboarding_step: 6 }).eq("id", user.id)
      await supabase.from("onboarding_responses").update({ onboarding_finished_at: new Date().toISOString() }).eq("user_id", user.id)
      router.push(goToUpload ? "/upload" : "/")
    } catch (err) {
      console.error("[Onboarding] Finish error:", err)
      router.push("/")
    } finally {
      setIsSaving(false)
    }
  }

  const stepConfig = STEP_CONFIG[currentStep - 1]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-widest uppercase text-foreground">CONDOR</span>
        </div>
        {currentStep < TOTAL_STEPS && (
          <button onClick={() => handleFinish()} className="text-sm text-neutral-400 hover:text-foreground transition-colors">
            Skip setup
          </button>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* Left sidebar — step list (desktop only) */}
        <div className="hidden lg:flex w-64 xl:w-72 flex-shrink-0 flex-col gap-1 px-6 pt-10 border-r border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Setup steps</p>
          {STEP_CONFIG.map((step, i) => {
            const stepNum = i + 1
            const isCompleted = stepNum < currentStep
            const isCurrent = stepNum === currentStep
            return (
              <div
                key={stepNum}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isCurrent ? "bg-foreground/5 border border-border" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                    isCompleted ? "bg-primary text-primary-foreground" :
                    isCurrent ? "bg-foreground text-background" :
                    "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ) : stepNum}
                </div>
                <span className={`text-sm ${isCurrent ? "font-semibold text-foreground" : isCompleted ? "text-neutral-500" : "text-neutral-400"}`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-start justify-center px-6 lg:px-16 py-10 overflow-y-auto">
          <div className="w-full max-w-lg">

            {/* Mobile progress */}
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < currentStep ? "bg-foreground" : i === currentStep - 1 ? "bg-foreground/40" : "bg-border"}`} />
              ))}
            </div>

            {/* Step header */}
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Step {currentStep} of {TOTAL_STEPS}
              </p>
              <h1 className="text-2xl font-bold text-foreground">{stepConfig.title}</h1>
              <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{stepConfig.subtitle}</p>
            </div>

            {error && (
              <div className="mb-5 text-sm text-red-500 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Step content */}
            {currentStep === 1 && <StepPersonal data={data} onChange={updateData} />}
            {currentStep === 2 && <StepCompany data={data} onChange={updateData} />}
            {currentStep === 3 && <StepGoals data={data} onChange={updateData} />}
            {currentStep === 4 && <StepWorkspace data={data} onChange={updateData} />}
            {currentStep === 5 && <StepGetData onFinish={handleFinish} />}

            {/* Navigation */}
            {currentStep < TOTAL_STEPS && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                {currentStep > 1 ? (
                  <button type="button" onClick={() => { setError(null); setCurrentStep(p => Math.max(1, p - 1)) }} disabled={isSaving}
                    className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-foreground transition-colors disabled:opacity-40"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : <div />}

                <Button onClick={handleNext} disabled={isSaving} className="gap-2 px-6 h-11 rounded-xl font-semibold">
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving…
                    </span>
                  ) : (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}