/**
 * File: page.tsx
 * Path: /app/settings/page.tsx
 * Last Modified: 2026-04-19
 *
 * Root cause of "Failed to save.":
 *   Supabase PostgrestErrors are NOT instanceof Error, so the catch
 *   was showing the fallback text instead of the real message.
 *   Fix: extract .message from any object in catch.
 *
 * Root cause of workspace not showing:
 *   Plain .select() array approach — never throws, always gets first row.
 *
 * Root cause of save failing silently:
 *   UPDATE policy on workspaces was never created (SQL block stopped
 *   at the first "already exists" error). Run this SQL in Supabase:
 *   CREATE POLICY "owner_update_workspace" ON public.workspaces
 *   FOR UPDATE USING (owner_id = auth.uid());
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useSidebarState } from "@/lib/hooks/useSidebarState"
import { clearUserProfileCache } from "@/lib/hooks/useUserProfile"
import { Input } from "@/components/ui/input"
import { Check, Save, User, Building2, Shield, ArrowUpRight, Camera } from "lucide-react"
import Link from "next/link"

const C = { orange: "#ef7800" }

// Extracts a human-readable message from any error type (including Supabase PostgrestError)
function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error"
  if (err instanceof Error) return err.message
  if (typeof err === "object" && "message" in err) return String((err as { message: unknown }).message)
  return String(err)
}

function AvatarUpload({
  name, avatarUrl, size = 72, onUpload,
}: { name: string; avatarUrl?: string | null; size?: number; onUpload: (url: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [localUrl, setLocalUrl] = useState<string | null>(avatarUrl ?? null)
  useEffect(() => { setLocalUrl(avatarUrl ?? null) }, [avatarUrl])

  const initials = name
    ? name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("")
    : "?"
  const COLORS = ["#004898", "#ef7800", "#212121", "#0a66c2", "#7c3aed", "#059669", "#dc2626"]
  const bg = name ? COLORS[name.charCodeAt(0) % COLORS.length] : COLORS[0]

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = () => setLocalUrl(reader.result as string)
      reader.readAsDataURL(file)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split(".").pop() ?? "jpg"
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
      if (uploadError) { console.warn("Avatar storage not configured yet."); return }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)
      onUpload(publicUrl)
    } catch (err) {
      console.error("Avatar upload error:", err)
    } finally { setUploading(false) }
  }

  return (
    <div className="relative cursor-pointer group flex-shrink-0" style={{ width: size, height: size }}
      onClick={() => fileInputRef.current?.click()}>
      {localUrl
        ? <img src={localUrl} alt="" className="rounded-full object-cover w-full h-full" />
        : <div className="rounded-full w-full h-full flex items-center justify-center text-white font-bold"
            style={{ background: bg, fontSize: size * 0.35 }}>{initials}</div>}
      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        {uploading
          ? <span className="w-5 h-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          : <Camera className="w-6 h-6 text-white" />}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  )
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${C.orange}12` }}>
          <Icon className="w-4 h-4" style={{ color: C.orange }} />
        </div>
        <h2 className="font-semibold text-sm text-foreground"
          style={{ fontFamily: "var(--font-montserrat)" }}>{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

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
  const [wsLoaded, setWsLoaded] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)
  const [planName, setPlanName] = useState("Flight")

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      setEmail(user.email ?? "")

      // Profile
      const { data: profile } = await supabase.from("profiles")
        .select("full_name, job_title, avatar_url").eq("id", user.id).single()
      if (profile) {
        setFullName(profile.full_name ?? "")
        setJobTitle(profile.job_title ?? "")
        setAvatarUrl(profile.avatar_url ?? null)
      }

      // Workspace — plain array query, take first result manually
      const { data: wsRows } = await supabase
        .from("workspaces")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true })
      if (wsRows && wsRows.length > 0) {
        setWorkspaceId(wsRows[0].id)
        setWorkspaceName(wsRows[0].name ?? "")
      }
      setWsLoaded(true)

      // Subscription
      const { data: sub } = await supabase.from("subscriptions")
        .select("status, trial_end, subscription_plans(name)")
        .eq("user_id", user.id).maybeSingle()
      if (sub) {
        type S = {
          status: string; trial_end: string | null
          subscription_plans: { name: string } | { name: string }[] | null
        }
        const s = sub as S
        const plans = s.subscription_plans
        const name = Array.isArray(plans)
          ? plans[0]?.name
          : (plans as { name?: string } | null)?.name
        if (name) setPlanName(name)
        if (s.status === "trialing" && s.trial_end) {
          setTrialDaysLeft(Math.max(0, Math.ceil(
            (new Date(s.trial_end).getTime() - Date.now()) / 86400000
          )))
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

      // 1. Save profile
      const { error: pErr } = await supabase.from("profiles")
        .update({ full_name: fullName.trim(), job_title: jobTitle.trim() })
        .eq("id", user.id)
      if (pErr) throw pErr

      // 2. Save workspace name
      // Requires UPDATE policy: CREATE POLICY "owner_update_workspace"
      // ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());
      if (workspaceName.trim()) {
        if (workspaceId) {
          const { error: wErr } = await supabase.from("workspaces")
            .update({ name: workspaceName.trim() })
            .eq("id", workspaceId)
          if (wErr) throw wErr
        } else {
          // No workspace found on load → INSERT
          const { data: newWs, error: iErr } = await supabase.from("workspaces")
            .insert({ name: workspaceName.trim(), owner_id: user.id })
            .select("id").single()
          if (iErr) throw iErr
          if (newWs) setWorkspaceId(newWs.id)
        }
      }

      // 3. Bust profile cache → header badge updates
      clearUserProfileCache()
      window.dispatchEvent(new CustomEvent("condor:profile-updated"))

      // 4. Show green "Saved!" confirmation
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

    } catch (err: unknown) {
      // Supabase errors are PostgrestError objects, NOT instanceof Error
      // getErrorMessage() handles both cases
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const labelClass = "text-xs font-semibold uppercase tracking-wide text-neutral-500"

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? "16rem" : "5rem",
          width: sidebarOpen ? "calc(100vw - 16rem)" : "calc(100vw - 5rem)",
        }}>
        <div className="sticky top-0 z-30 bg-background"><Header /></div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-4xl w-full mx-auto space-y-6">

            <div>
              <h1 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.02em" }}
                className="text-foreground">Settings</h1>
              <p className="text-sm text-neutral-500 mt-1">Manage your profile and workspace.</p>
            </div>

            {trialDaysLeft !== null && (
              <div className={`flex items-center justify-between rounded-xl border px-5 py-4 ${
                trialDaysLeft <= 7
                  ? "border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800"
                  : "border-border"
              }`}>
                <div>
                  <p className={`text-sm font-semibold ${trialDaysLeft <= 7 ? "text-orange-700 dark:text-orange-400" : "text-foreground"}`}>
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

            {/* Error — now shows real Supabase error message, not just "Failed to save." */}
            {error && (
              <div className="text-sm rounded-xl px-4 py-3 border border-red-200 bg-red-50 text-red-600 leading-relaxed">
                {error}
              </div>
            )}

            <Section icon={User} title="Profile">
              <div className="flex items-start gap-5 mb-6 pb-6 border-b border-border">
                <AvatarUpload name={fullName} avatarUrl={avatarUrl} size={72} onUpload={url => setAvatarUrl(url)} />
                <div>
                  <p className="font-semibold text-sm text-foreground">{fullName || "Your name"}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{email}</p>
                  <p className="text-xs mt-1.5 text-neutral-400">Click the avatar to upload a photo.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Full name</label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Your name" className="h-10 rounded-xl text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Job title</label>
                  <Input value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                    placeholder="Marketing Manager" className="h-10 rounded-xl text-sm" />
                </div>
              </div>
            </Section>

            <Section icon={Shield} title="Account">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className={labelClass}>Email address</label>
                  <Input value={email} disabled readOnly className="h-10 rounded-xl text-sm opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-neutral-500">
                    Managed via{" "}
                    <Link href="/auth/forgot-password" className="underline underline-offset-2">password reset</Link>.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-neutral-50 dark:bg-neutral-800/40 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Password</p>
                    <p className="text-xs mt-0.5 text-neutral-500">Change your password.</p>
                  </div>
                  <Link href="/auth/forgot-password"
                    className="text-sm font-semibold hover:underline underline-offset-4 flex-shrink-0"
                    style={{ color: C.orange }}>
                    Reset →
                  </Link>
                </div>
              </div>
            </Section>

            <Section icon={Building2} title="Project">
              <div className="max-w-sm space-y-1.5">
                <label className={labelClass}>Project name</label>
                {!wsLoaded
                  ? <div className="h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                  : <Input
                      value={workspaceName}
                      onChange={e => setWorkspaceName(e.target.value)}
                      placeholder="Project name"
                      className="h-10 rounded-xl text-sm"
                    />
                }
                <p className="text-xs text-neutral-500">
                  Displayed throughout your CONDOR dashboard.
                </p>
              </div>
            </Section>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-neutral-500">
                {saved ? "All changes saved." : "Unsaved changes will be lost on navigation."}
              </p>
              {/* Green "Saved!" confirmation — stays 3 seconds after save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 h-10 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-all duration-300"
                style={{
                  background: saved
                    ? "#16a34a"
                    : `linear-gradient(135deg, #c44a00, ${C.orange})`,
                }}
              >
                {saving
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  : saved
                    ? <><Check className="w-4 h-4" /> Saved!</>
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