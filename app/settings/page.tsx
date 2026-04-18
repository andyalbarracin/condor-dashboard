/**
 * File: page.tsx
 * Path: /app/settings/page.tsx
 * Last Modified: 2026-04-17
 * Description: CONDOR Settings — wider layout (max-w-4xl), uses full available width.
 *   Avatar upload: camera icon overlay on hover, uploads to Supabase Storage 'avatars' bucket.
 *   TODO: Create 'avatars' bucket in Supabase Storage (public access) before enabling upload.
 *   Trial badge, profile fields, account security, workspace name.
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import { Input } from "@/components/ui/input"
import { Check, Save, User, Building2, Shield, ArrowUpRight, Camera } from "lucide-react"
import Link from "next/link"

const C = { orange: "#ef7800", carbon: "#212121", grey: "#818181", alabaster: "#e0e0e0" }

// ================================================================
// AVATAR with camera overlay + upload
// ================================================================
function AvatarUpload({
  name, avatarUrl, size = 72,
  onUpload
}: { name: string; avatarUrl?: string | null; size?: number; onUpload: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [localUrl, setLocalUrl] = useState<string | null>(avatarUrl ?? null)

  // Sync when avatarUrl prop changes
  useEffect(() => { setLocalUrl(avatarUrl ?? null) }, [avatarUrl])

  const initials = name
    ? name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("")
    : "?"
  const colors = ["#004898", "#ef7800", "#212121", "#0a66c2", "#7c3aed", "#059669", "#dc2626"]
  const bg = name ? colors[name.charCodeAt(0) % colors.length] : colors[0]

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // Show preview immediately
      const reader = new FileReader()
      reader.onload = () => setLocalUrl(reader.result as string)
      reader.readAsDataURL(file)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const ext = file.name.split('.').pop() ?? "jpg"
      const path = `avatars/${user.id}.${ext}`

      // TODO: Create 'avatars' bucket in Supabase Storage with public access before this works
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true })

      if (uploadError) {
        // Bucket likely not set up yet — keep local preview
        console.warn("[AvatarUpload] Storage not configured:", uploadError.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)
      onUpload(publicUrl)
    } catch (err) {
      console.error("[AvatarUpload] Error:", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative cursor-pointer group flex-shrink-0" style={{ width: size, height: size }}
      onClick={() => fileInputRef.current?.click()}>
      {/* Avatar circle */}
      {localUrl ? (
        <img src={localUrl} alt="" className="rounded-full object-cover w-full h-full" />
      ) : (
        <div className="rounded-full w-full h-full flex items-center justify-center text-white font-bold"
          style={{ background: bg, fontSize: size * 0.35 }}>
          {initials}
        </div>
      )}
      {/* Camera overlay on hover */}
      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading ? (
          <span className="w-5 h-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}

// ================================================================
// SECTION CARD
// ================================================================
function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden" style={{ borderColor: C.alabaster }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: C.alabaster }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.orange}12` }}>
          <Icon className="w-4 h-4" style={{ color: C.orange }} />
        </div>
        <h2 className="font-semibold text-sm text-foreground" style={{ fontFamily: "var(--font-montserrat)" }}>{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// ================================================================
// MAIN
// ================================================================
export default function SettingsPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useSidebarState()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)
  const [planName, setPlanName] = useState("Flight")

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      setEmail(user.email ?? "")

      const { data: profile } = await supabase
        .from("profiles").select("full_name, job_title, avatar_url").eq("id", user.id).single()
      if (profile) {
        setFullName(profile.full_name ?? "")
        setJobTitle(profile.job_title ?? "")
        setAvatarUrl(profile.avatar_url ?? null)
      }

      const { data: ws } = await supabase.from("workspaces").select("id, name").eq("owner_id", user.id).limit(1).single()
      if (ws) { setWorkspaceId(ws.id); setWorkspaceName(ws.name ?? "") }

      const { data: sub } = await supabase.from("subscriptions")
        .select("status, trial_end, subscription_plans(name)").eq("user_id", user.id).single()
      if (sub) {
        type S = { status: string; trial_end: string | null; subscription_plans: { name: string } | { name: string }[] | null }
        const s = sub as S
        const plans = s.subscription_plans
        const name = Array.isArray(plans) ? plans[0]?.name : plans?.name
        if (name) setPlanName(name)
        if (s.status === "trialing" && s.trial_end) {
          setTrialDaysLeft(Math.max(0, Math.ceil((new Date(s.trial_end).getTime() - Date.now()) / 86400000)))
        }
      }
    }
    load()
  }, [router])

  const handleSave = async () => {
    setError(null); setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const { error: pErr } = await supabase.from("profiles").update({ full_name: fullName.trim(), job_title: jobTitle.trim() }).eq("id", user.id)
      if (pErr) throw pErr
      if (workspaceId && workspaceName.trim()) {
        const { error: wErr } = await supabase.from("workspaces").update({ name: workspaceName.trim() }).eq("id", workspaceId)
        if (wErr) throw wErr
      }
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save changes.")
    } finally { setSaving(false) }
  }

  const fl = "text-xs font-semibold uppercase tracking-wide"

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "16rem" : "5rem", width: sidebarOpen ? "calc(100vw - 16rem)" : "calc(100vw - 5rem)" }}>
        <div className="sticky top-0 z-30 bg-background"><Header /></div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          {/* max-w-4xl to use more available width */}
          <div className="max-w-4xl w-full mx-auto space-y-6">

            <div>
              <h1 className="text-foreground" style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>Settings</h1>
              <p className="text-sm text-neutral-500 mt-1">Manage your profile and workspace.</p>
            </div>

            {/* Trial banner */}
            {trialDaysLeft !== null && (
              <div className="flex items-center justify-between rounded-xl border px-5 py-4"
                style={{ borderColor: trialDaysLeft <= 7 ? "#fed7aa" : C.alabaster, background: trialDaysLeft <= 7 ? "#fff7ed" : "transparent" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: trialDaysLeft <= 7 ? "#c2410c" : C.carbon }}>
                    {planName} plan · {trialDaysLeft === 0 ? "Trial expired" : `${trialDaysLeft} days left in trial`}
                  </p>
                  <p className="text-xs mt-0.5 text-neutral-500">Upgrade to keep full access after your trial ends.</p>
                </div>
                <Link href="/pricing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, #c44a00, ${C.orange})` }}>
                  Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {error && <div className="text-sm rounded-xl px-4 py-3 border border-red-200 bg-red-50 text-red-600">{error}</div>}

            {/* Profile — two columns on desktop */}
            <Section icon={User} title="Profile">
              {/* Avatar + info row */}
              <div className="flex items-start gap-5 mb-6 pb-6" style={{ borderBottom: `1px solid ${C.alabaster}` }}>
                <AvatarUpload name={fullName} avatarUrl={avatarUrl} size={72} onUpload={url => setAvatarUrl(url)} />
                <div>
                  <p className="font-semibold text-sm text-foreground">{fullName || "Your name"}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{email}</p>
                  <p className="text-xs mt-1.5" style={{ color: C.grey }}>
                    Click the avatar to upload a photo.
                    {/* TODO: Supabase Storage 'avatars' bucket must be created with public access */}
                  </p>
                </div>
              </div>
              {/* Name + job title — side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={fl} style={{ color: C.grey }}>Full name</label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name"
                    className="h-10 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
                </div>
                <div className="space-y-1.5">
                  <label className={fl} style={{ color: C.grey }}>Job title</label>
                  <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Marketing Manager"
                    className="h-10 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
                </div>
              </div>
            </Section>

            {/* Account — two columns */}
            <Section icon={Shield} title="Account">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className={fl} style={{ color: C.grey }}>Email address</label>
                  <Input value={email} disabled readOnly className="h-10 rounded-xl text-sm opacity-60"
                    style={{ borderColor: C.alabaster, color: C.carbon, cursor: "not-allowed" }} />
                  <p className="text-xs" style={{ color: C.grey }}>
                    Managed via{" "}
                    <Link href="/auth/forgot-password" className="underline underline-offset-2">password reset</Link>.
                  </p>
                </div>
                <div className="rounded-xl border p-4 flex items-center justify-between"
                  style={{ borderColor: C.alabaster, background: "#fafafa" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.carbon }}>Password</p>
                    <p className="text-xs mt-0.5" style={{ color: C.grey }}>Change your password.</p>
                  </div>
                  <Link href="/auth/forgot-password" className="text-sm font-semibold hover:underline underline-offset-4 flex-shrink-0" style={{ color: C.orange }}>
                    Reset →
                  </Link>
                </div>
              </div>
            </Section>

            {/* Workspace */}
            <Section icon={Building2} title="Project">
              <div className="max-w-sm space-y-1.5">
                <label className={fl} style={{ color: C.grey }}>Project name</label>
                <Input value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="My Company"
                  className="h-10 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
                <p className="text-xs" style={{ color: C.grey }}>Displayed throughout your CONDOR dashboard.</p>
              </div>
            </Section>

            {/* Save */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs" style={{ color: C.grey }}>Changes saved to your Supabase account.</p>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 h-10 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-all"
                style={{ background: saved ? "#16a34a" : `linear-gradient(135deg, #c44a00, ${C.orange})` }}>
                {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  : saved ? <><Check className="w-4 h-4" /> Saved!</>
                  : <><Save className="w-4 h-4" /> Save changes</>}
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  )
}