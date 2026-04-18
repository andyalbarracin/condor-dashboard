/**
 * File: page.tsx
 * Path: /app/onboarding/page.tsx
 * Last Modified: 2026-04-17
 * Description: CONDOR onboarding — redesigned with CONDOR color palette.
 *   Layout: dark left sidebar (#212121) + white right content — fills 100vh, NO scrollbar on desktop.
 *   Sidebar: mountain header strip, step list with amber indicators, progress bar, "Skip setup".
 *   Content: light (#fdfdfd bg), clean typography (Montserrat), compact forms that fit viewport.
 *   Mobile: single column, image header strip, progress bar, scrollable content.
 *   Palette: #ef7800 orange, #212121 carbon, #818181 grey, #e0e0e0 alabaster, #fdfdfd white.
 *
 *   Data saved to Supabase:
 *   - profiles: full_name, job_title, country, company_name, industry, company_size,
 *               website_url, posting_frequency, referral_source, onboarding_step
 *   - workspaces: name, industry, website_url (created at step 4)
 *   - onboarding_responses: goals, acquisition_detail, current_tools (upserted at step 4)
 *
 *   5 steps: About you → Your company → Your goals → First project → Get your data
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ChevronRight, ArrowLeft, ExternalLink, Upload, Check } from "lucide-react"
import { Input } from "@/components/ui/input"

// ================================================================
// PALETTE
// ================================================================
const C = {
  orange: "#ef7800",
  carbon: "#212121",
  grey: "#818181",
  alabaster: "#e0e0e0",
  white: "#fdfdfd",
  sidebarBg: "#181818",
  sidebarBorder: "rgba(255,255,255,0.07)",
}

// ================================================================
// TYPES & DATA
// ================================================================
interface OData {
  full_name: string; job_title: string; country: string
  company_name: string; industry: string; company_size: string; website_url: string
  goals: string[]; posting_frequency: string
  workspace_name: string; referral_source: string; acquisition_detail: string
}

const TOTAL = 5

const JOBS = ["Marketing Manager","Content Manager","Social Media Manager","Digital Marketing Specialist","Marketing Director","Business Owner","Agency Owner / Director","Freelancer","Other"]
const LATAM = ["Argentina","Chile","Colombia","Uruguay","México","Brasil","Perú","Venezuela","Bolivia","Paraguay","Ecuador"]
const OTHER_C = ["España","United States","United Kingdom","Canada","Australia","Other"]
const ALL_COUNTRIES = [...LATAM, "—", ...OTHER_C]
const INDUSTRIES = ["Telecom / Network Infrastructure","SaaS / Software","B2B Technology","Fintech / Financial Services","E-commerce / Retail","Healthcare","Education","Media / Publishing","Marketing Agency","Consulting","Manufacturing","Real Estate","Other"]
const SIZES = [
  { value: "1-10", label: "1–10", sub: "Just me / small team" },
  { value: "11-50", label: "11–50", sub: "Small company" },
  { value: "51-200", label: "51–200", sub: "Mid-size" },
  { value: "201-500", label: "201–500", sub: "Growing" },
  { value: "500+", label: "500+", sub: "Large org" },
]
const GOALS = [
  { id: "know_what_works", label: "Know which content actually works", sub: "Stop guessing — see what drives real results." },
  { id: "justify_investment", label: "Justify social media investment", sub: "Show leadership ROI backed by data." },
  { id: "save_time_reporting", label: "Spend less time on reports", sub: "From 4 hours to 15 minutes per month." },
  { id: "understand_audience", label: "Understand my audience better", sub: "Who's engaging, and why." },
  { id: "benchmark_industry", label: "Compare against industry benchmarks", sub: "Know if you're above average." },
  { id: "plan_smarter", label: "Plan a smarter content calendar", sub: "Right time, right format." },
]
const FREQS = [
  { value: "daily", label: "Every day" },
  { value: "2-3x_week", label: "2–3 times / week" },
  { value: "1x_week", label: "Once a week" },
  { value: "less_than_weekly", label: "Less than weekly" },
  { value: "not_sure", label: "I'm figuring it out" },
]
const REFS = [
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
  { id: "linkedin", name: "LinkedIn Analytics", accent: "#0a66c2",
    steps: ["Go to your LinkedIn Company Page","Click Analytics in the top navigation","Select Content, Followers, or Visitors","Set your date range","Click Export → Download as XLS"],
    url: "https://www.linkedin.com/company/", urlLabel: "Open LinkedIn →",
    note: "Export Content, Followers, and Visitors separately for the best results." },
  { id: "twitter", name: "X / Twitter Analytics", accent: "#374151",
    steps: ["Go to analytics.twitter.com","Select the Tweets tab","Set your date range","Click Export data → Download CSV"],
    url: "https://analytics.twitter.com", urlLabel: "Open X Analytics →",
    note: "Export both the Tweets report and Account Overview." },
  { id: "ga4", name: "Google Analytics 4", accent: "#ef7800",
    steps: ["Go to analytics.google.com","Reports → Acquisition → Traffic acquisition","Set your date range","Share → Download file → Download CSV"],
    url: "https://analytics.google.com", urlLabel: "Open Google Analytics →",
    note: "Export with UTM source/medium data for the best results." },
]
const STEPS = [
  { title: "About you", subtitle: "Let's personalise your experience." },
  { title: "Your company", subtitle: "We'll match the right benchmarks." },
  { title: "Your goals", subtitle: "We'll prioritise what you see first." },
  { title: "First project", subtitle: "A project organises all your data." },
  { title: "Connect your data", subtitle: "How to get your first analytics files." },
]

// ================================================================
// STYLE HELPERS
// ================================================================
const fieldLabel: React.CSSProperties = { fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.grey, display: "block", marginBottom: "0.35rem" }
const selectStyle: React.CSSProperties = { height: "2.5rem", paddingLeft: "0.75rem", paddingRight: "0.75rem", borderRadius: "0.625rem", border: `1px solid ${C.alabaster}`, background: "#fff", color: C.carbon, fontSize: "0.875rem", width: "100%", appearance: "none" }

function FieldSelect({ id, value, onChange, options, placeholder }: { id: string; value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; placeholder: string }) {
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
      <option value="">{placeholder}</option>
      {options.map(opt => {
        if (typeof opt === "string") return opt === "—" ? <option key="sep" disabled value="">──────────</option> : <option key={opt} value={opt}>{opt}</option>
        return <option key={opt.value} value={opt.value}>{opt.label}</option>
      })}
    </select>
  )
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-left transition-all border"
      style={{
        background: selected ? `${C.orange}12` : "#fff",
        borderColor: selected ? `${C.orange}70` : C.alabaster,
        color: selected ? C.orange : C.carbon,
        fontWeight: selected ? 600 : 400,
      }}>
      {children}
      {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
    </button>
  )
}

// ================================================================
// STEP COMPONENTS — all designed to fit in ~520px content height
// ================================================================

function S1({ data, onChange }: { data: OData; onChange: (u: Partial<OData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label style={fieldLabel}>Full name</label>
        <Input value={data.full_name} onChange={e => onChange({ full_name: e.target.value })} placeholder="Alex Smith" autoFocus
          className="h-10 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
      </div>
      <div>
        <label style={fieldLabel}>Role</label>
        <FieldSelect id="jt" value={data.job_title} onChange={v => onChange({ job_title: v })} options={JOBS} placeholder="Select your role…" />
      </div>
      <div>
        <label style={fieldLabel}>Country</label>
        <FieldSelect id="co" value={data.country} onChange={v => onChange({ country: v })} options={ALL_COUNTRIES} placeholder="Select country…" />
      </div>
    </div>
  )
}

function S2({ data, onChange }: { data: OData; onChange: (u: Partial<OData>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label style={fieldLabel}>Company name</label>
        <Input value={data.company_name} onChange={e => onChange({ company_name: e.target.value })} placeholder="Asentria" autoFocus
          className="h-10 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
      </div>
      <div>
        <label style={fieldLabel}>Industry</label>
        <FieldSelect id="ind" value={data.industry} onChange={v => onChange({ industry: v })} options={INDUSTRIES} placeholder="Select industry…" />
      </div>
      <div>
        <label style={fieldLabel}>Company size</label>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map(s => (
            <button key={s.value} type="button" onClick={() => onChange({ company_size: s.value })}
              className="rounded-xl border p-2.5 text-left transition-all"
              style={{ background: data.company_size === s.value ? `${C.orange}12` : "#fff", borderColor: data.company_size === s.value ? `${C.orange}70` : C.alabaster }}>
              <div className="font-semibold text-sm" style={{ color: data.company_size === s.value ? C.orange : C.carbon }}>{s.label}</div>
              <div className="text-xs mt-0.5" style={{ color: C.grey }}>{s.sub}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={fieldLabel}>Website <span style={{ color: C.alabaster, fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
        <Input type="url" value={data.website_url} onChange={e => onChange({ website_url: e.target.value })} placeholder="https://company.com"
          className="h-10 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
      </div>
    </div>
  )
}

function S3({ data, onChange }: { data: OData; onChange: (u: Partial<OData>) => void }) {
  const toggleGoal = (id: string) => onChange({ goals: data.goals.includes(id) ? data.goals.filter(g => g !== id) : [...data.goals, id] })
  return (
    <div className="space-y-5">
      <div>
        <label style={{ ...fieldLabel, marginBottom: "0.5rem" }}>Primary goals <span style={{ color: C.alabaster, fontWeight: 400, textTransform: "none" }}>(select all that apply)</span></label>
        <div className="space-y-2">
          {GOALS.map(g => {
            const sel = data.goals.includes(g.id)
            return (
              <button key={g.id} type="button" onClick={() => toggleGoal(g.id)}
                className="w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all"
                style={{ background: sel ? `${C.orange}10` : "#fff", borderColor: sel ? `${C.orange}60` : C.alabaster }}>
                <div className="w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
                  style={{ borderColor: sel ? C.orange : C.alabaster, background: sel ? C.orange : "#fff" }}>
                  {sel && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium leading-tight" style={{ color: sel ? C.orange : C.carbon }}>{g.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.grey }}>{g.sub}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <label style={fieldLabel}>Publishing frequency</label>
        <div className="grid grid-cols-2 gap-2">
          {FREQS.map(f => <Chip key={f.value} selected={data.posting_frequency === f.value} onClick={() => onChange({ posting_frequency: f.value })}>{f.label}</Chip>)}
        </div>
      </div>
    </div>
  )
}

function S4({ data, onChange }: { data: OData; onChange: (u: Partial<OData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label style={fieldLabel}>Project name</label>
        <p className="text-xs mb-2" style={{ color: C.grey }}>Groups all your analytics data. You can create more projects later.</p>
        <Input value={data.workspace_name} onChange={e => onChange({ workspace_name: e.target.value })} placeholder={data.company_name || "My Company"} autoFocus
          className="h-10 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
      </div>
      <div>
        <label style={fieldLabel}>How did you hear about CONDOR?</label>
        <div className="grid grid-cols-2 gap-2">
          {REFS.map(r => <Chip key={r.value} selected={data.referral_source === r.value} onClick={() => onChange({ referral_source: r.value })}>{r.label}</Chip>)}
        </div>
      </div>
      {data.referral_source && (
        <div>
          <label style={fieldLabel}>More details? <span style={{ color: C.alabaster, fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
          <Input value={data.acquisition_detail} onChange={e => onChange({ acquisition_detail: e.target.value })} placeholder="e.g. A specific post, name of a friend…"
            className="h-10 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
        </div>
      )}
    </div>
  )
}

function S5({ onFinish }: { onFinish: (goUpload: boolean) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4" style={{ background: "#fff8f0", borderColor: `${C.orange}25` }}>
        <p className="text-sm leading-relaxed" style={{ color: C.carbon }}>
          CONDOR works with files you download from LinkedIn, X, and Google Analytics.
          No API access needed —{" "}
          <span className="font-semibold">download a file, upload it, and CONDOR interprets everything.</span>
        </p>
      </div>
      <div className="space-y-3">
        {PLATFORM_GUIDES.map(p => (
          <div key={p.id} className="rounded-xl border overflow-hidden" style={{ borderColor: C.alabaster, borderLeftColor: p.accent, borderLeftWidth: "3px" }}>
            <div className="px-4 py-2.5 border-b" style={{ borderColor: C.alabaster }}>
              <span className="font-semibold text-sm" style={{ color: C.carbon }}>{p.name}</span>
            </div>
            <div className="px-4 py-3 space-y-2.5" style={{ background: "#fafafa" }}>
              <ol className="space-y-1.5">
                {p.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: C.grey }}>
                    <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                      style={{ background: `${p.accent}18`, color: p.accent }}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              {p.note && <p className="text-xs italic" style={{ color: C.grey, borderTop: `1px solid ${C.alabaster}`, paddingTop: "0.5rem" }}>Note: {p.note}</p>}
              <a href={p.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: p.accent }}>
                {p.urlLabel} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-2.5 pt-1">
        <button onClick={() => onFinish(true)}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm text-white"
          style={{ background: `linear-gradient(135deg, #c44a00, ${C.orange})` }}>
          <Upload className="w-4 h-4" />
          I have my files — take me to upload
        </button>
        <button onClick={() => onFinish(false)}
          className="w-full h-10 rounded-xl font-medium text-sm border"
          style={{ background: "transparent", borderColor: C.alabaster, color: C.grey }}>
          Go to dashboard first
        </button>
      </div>
    </div>
  )
}

// ================================================================
// MAIN
// ================================================================

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<OData>({ full_name: "", job_title: "", country: "", company_name: "", industry: "", company_size: "", website_url: "", goals: [], posting_frequency: "", workspace_name: "", referral_source: "", acquisition_detail: "" })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return }
      const name = user.user_metadata?.full_name || user.user_metadata?.name || ""
      setData(prev => ({ ...prev, full_name: prev.full_name || name }))
    })
  }, [router])

  const update = useCallback((u: Partial<OData>) => {
    setData(prev => {
      const next = { ...prev, ...u }
      if (u.company_name && !prev.workspace_name) next.workspace_name = u.company_name
      return next
    })
  }, [])

  const validate = (): string | null => {
    if (step === 1) {
      if (!data.full_name.trim()) return "Please enter your name."
      if (!data.job_title) return "Please select your role."
      if (!data.country) return "Please select your country."
    }
    if (step === 2) {
      if (!data.company_name.trim()) return "Please enter your company name."
      if (!data.industry) return "Please select your industry."
      if (!data.company_size) return "Please select your company size."
    }
    if (step === 3) {
      if (data.goals.length === 0) return "Select at least one goal."
      if (!data.posting_frequency) return "Please select your publishing frequency."
    }
    if (step === 4) {
      if (!data.workspace_name.trim()) return "Please enter a project name."
    }
    return null
  }

  // Save to Supabase — profiles + workspaces + onboarding_responses
  const saveStep = async (s: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (s === 1) {
      await supabase.from("profiles").update({ full_name: data.full_name, job_title: data.job_title, country: data.country, onboarding_step: 1 }).eq("id", user.id)
    }
    if (s === 2) {
      await supabase.from("profiles").update({ company_name: data.company_name, industry: data.industry, company_size: data.company_size, website_url: data.website_url || null, onboarding_step: 2 }).eq("id", user.id)
    }
    if (s === 3) {
      await supabase.from("profiles").update({ posting_frequency: data.posting_frequency, onboarding_step: 3 }).eq("id", user.id)
    }
    if (s === 4) {
      // Create first workspace
      const { error: wsErr } = await supabase.from("workspaces").insert({ owner_id: user.id, name: data.workspace_name, industry: data.industry || null, website_url: data.website_url || null })
      if (wsErr && !wsErr.message.includes("duplicate")) throw wsErr
      await supabase.from("profiles").update({ referral_source: data.referral_source || null, onboarding_step: 4 }).eq("id", user.id)
      // Save onboarding responses
      await supabase.from("onboarding_responses").upsert({ user_id: user.id, goals: data.goals, acquisition_detail: data.acquisition_detail || null, onboarding_started_at: new Date().toISOString() })
    }
  }

  const handleNext = async () => {
    setError(null)
    const err = validate()
    if (err) { setError(err); return }
    setSaving(true)
    try { await saveStep(step); setStep(p => p + 1) }
    catch { setError("Something went wrong. Please try again.") }
    finally { setSaving(false) }
  }

  const handleFinish = async (goUpload = false) => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from("profiles").update({ onboarding_completed: true, onboarding_step: 6 }).eq("id", user.id)
      await supabase.from("onboarding_responses").update({ onboarding_finished_at: new Date().toISOString() }).eq("user_id", user.id)
      router.push(goUpload ? "/upload" : "/")
    } catch { router.push("/") }
    finally { setSaving(false) }
  }

  const cfg = STEPS[step - 1]

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row" style={{ background: C.white }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="hidden lg:flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: "260px", background: C.sidebarBg, borderRight: `1px solid ${C.sidebarBorder}` }}>

        {/* Mountain image header */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ height: "140px" }}>
          <div className="absolute inset-0" style={{ backgroundImage: "url('/condor-login-screen-v1.png')", backgroundSize: "cover", backgroundPosition: "left 20%" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(24,24,24,0.2), rgba(24,24,24,0.98))" }} />
          <div className="absolute bottom-4 left-5">
            <div className="flex items-center gap-2">
              <img src="/condor-logo-v1.png" alt="" width={22} height={22} style={{ objectFit: "contain", filter: "invert(1)", opacity: 0.9 }} />
              <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.22em", color: "rgba(255,255,255,0.9)" }}>CONDOR</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Analytics · Setup</p>
          </div>
        </div>

        {/* Step list */}
        <div className="flex-1 px-4 pt-5 pb-4 overflow-y-auto">
          <p style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", marginBottom: "1rem" }}>
            SETUP STEPS
          </p>
          <div className="space-y-1">
            {STEPS.map((s, i) => {
              const sn = i + 1
              const done = sn < step
              const active = sn === step
              return (
                <div key={sn}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                  style={{ background: active ? `${C.orange}14` : "transparent", borderLeft: active ? `2px solid ${C.orange}` : "2px solid transparent" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      background: done ? C.orange : active ? `${C.orange}22` : "rgba(255,255,255,0.07)",
                      border: `2px solid ${done ? C.orange : active ? C.orange : "rgba(255,255,255,0.12)"}`,
                      color: done ? "#fff" : active ? C.orange : "rgba(255,255,255,0.3)",
                    }}>
                    {done ? <Check className="w-3 h-3" /> : sn}
                  </div>
                  <span className="text-sm font-medium leading-tight"
                    style={{ color: active ? C.orange : done ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.3)" }}>
                    {s.title}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5 mt-6 px-1">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all"
                style={{ background: i < step ? C.orange : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        </div>

        {/* Skip */}
        {step < TOTAL && (
          <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${C.sidebarBorder}` }}>
            <button onClick={() => handleFinish()} className="text-xs w-full text-left" style={{ color: "rgba(255,255,255,0.2)" }}>
              Skip setup →
            </button>
          </div>
        )}
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: C.white }}>

        {/* Mobile header */}
        <div className="lg:hidden flex-shrink-0">
          <div className="relative overflow-hidden" style={{ height: "100px" }}>
            <div className="absolute inset-0" style={{ backgroundImage: "url('/condor-login-screen-v1.png')", backgroundSize: "cover", backgroundPosition: "center 20%" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(24,24,24,0.3), rgba(24,24,24,0.9))" }} />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/condor-logo-v1.png" alt="" width={20} height={20} style={{ objectFit: "contain", filter: "invert(1)", opacity: 0.9 }} />
                <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.22em", color: "rgba(255,255,255,0.9)" }}>CONDOR</span>
              </div>
              {step < TOTAL && <button onClick={() => handleFinish()} style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>Skip →</button>}
            </div>
          </div>
          {/* Mobile progress */}
          <div className="flex gap-1 px-4 py-2" style={{ background: C.sidebarBg }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i < step ? C.orange : "rgba(255,255,255,0.12)" }} />
            ))}
          </div>
        </div>

        {/* Step content — scrollable on mobile, fits on desktop */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-8 lg:px-12 pt-7 pb-5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.alabaster}` }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.grey, marginBottom: "0.4rem" }}>
                STEP {step} OF {TOTAL}
              </p>
              <h1 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "clamp(1.5rem,2.5vw,1.85rem)", color: C.carbon, letterSpacing: "-0.025em", lineHeight: 1.15 }}>
                {cfg.title}
              </h1>
              <p className="mt-1 text-sm" style={{ color: C.grey }}>{cfg.subtitle}</p>
            </div>

            {/* Form content — scrollable area on desktop too if needed */}
            <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-5">
              {error && (
                <div className="mb-4 text-sm rounded-xl px-4 py-3 border border-red-200 bg-red-50 text-red-600">{error}</div>
              )}
              {step === 1 && <S1 data={data} onChange={update} />}
              {step === 2 && <S2 data={data} onChange={update} />}
              {step === 3 && <S3 data={data} onChange={update} />}
              {step === 4 && <S4 data={data} onChange={update} />}
              {step === 5 && <S5 onFinish={handleFinish} />}
            </div>

            {/* Nav buttons */}
            {step < TOTAL && (
              <div className="flex items-center justify-between px-8 lg:px-12 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${C.alabaster}` }}>
                {step > 1 ? (
                  <button type="button" onClick={() => { setError(null); setStep(p => Math.max(1, p - 1)) }} disabled={saving}
                    className="flex items-center gap-1.5 text-sm font-medium disabled:opacity-40"
                    style={{ color: C.grey }}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}
                <button onClick={handleNext} disabled={saving}
                  className="flex items-center gap-2 px-6 h-10 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, #c44a00, ${C.orange})` }}>
                  {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <>Continue <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}