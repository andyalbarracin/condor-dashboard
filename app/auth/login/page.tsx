/**
 * File: page.tsx
 * Path: /app/auth/login/page.tsx
 * Last Modified: 2026-04-17
 */

"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient, signInWithGoogle } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

const C = {
  orange: "#ef7800", orangeDark: "#c44a00",
  carbon: "#212121", grey: "#818181", alabaster: "#e0e0e0", white: "#fdfdfd",
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") ?? "/"

  useEffect(() => {
    const e = searchParams.get("error")
    if (e === "auth_failed") setError("Authentication failed. Please try again.")
    else if (e) setError("An error occurred. Please try again.")
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true); setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).single()
        if (!profile?.onboarding_completed) { router.push("/onboarding"); return }
      }
      router.push(nextPath.startsWith("/") ? nextPath : "/")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error"
      setError(msg === "Invalid login credentials" ? "Incorrect email or password." : msg)
    } finally { setIsLoading(false) }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true); setError(null)
    try { await signInWithGoogle(nextPath) }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Google sign-in failed"); setIsGoogleLoading(false) }
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Logo bar */}
      <div className="flex items-center px-8 lg:px-10 pt-6 pb-0 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f3f3f3" }}>
            <img src="/condor-logo-v1.png" alt="" width={26} height={26} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
          </div>
          <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.2em", color: C.carbon }}>CONDOR</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 lg:px-10">
        <div className="w-full max-w-[320px]">
          <div className="mb-7">
            <h1 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "1.45rem", color: C.carbon, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Welcome back to CONDOR
            </h1>
            <p className="text-sm mt-1.5" style={{ color: C.grey }}>Please enter your details to sign in.</p>
          </div>

          {error && <div className="mb-5 text-sm rounded-xl px-4 py-3 border border-red-200 bg-red-50 text-red-600">{error}</div>}

          <button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading || isLoading}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border font-medium text-sm transition-all disabled:opacity-50 mb-4"
            style={{ background: "#fff", borderColor: C.alabaster, color: C.carbon }}>
            {isGoogleLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" /> : (
              <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: C.alabaster }} /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs" style={{ color: C.grey }}>Or sign in with</span></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.grey }}>Email</label>
              <Input type="email" placeholder="johndoe@mail.com" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading || isGoogleLoading}
                className="h-11 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.grey }}>Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} required autoComplete="current-password"
                  placeholder="minimum 8 characters" value={password} onChange={e => setPassword(e.target.value)}
                  disabled={isLoading || isGoogleLoading} className="h-11 rounded-xl text-sm pr-10"
                  style={{ borderColor: C.alabaster, color: C.carbon }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.grey }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading || isGoogleLoading}
              className="w-full h-11 rounded-xl font-semibold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${C.orangeDark}, ${C.orange})` }}>
              {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : "Sign In →"}
            </button>
          </form>

          <div className="mt-3 text-center">
            <Link href="/auth/forgot-password" className="text-sm font-medium underline underline-offset-4" style={{ color: C.grey }}>
              Forgot password?
            </Link>
          </div>
          <p className="mt-5 text-center text-sm" style={{ color: C.grey }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="font-bold hover:underline underline-offset-4" style={{ color: C.carbon }}>Start free trial</Link>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-8 lg:px-10 py-4 flex-shrink-0 border-t"
        style={{ borderColor: C.alabaster, fontSize: "0.68rem", color: "#bbb" }}>
        <span>CONDOR Analytics © 2026 — All rights reserved</span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-neutral-600 transition-colors">Terms of Use</Link>
          <Link href="/support" className="hover:text-neutral-600 transition-colors">Support</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">

      {/* ══════ LEFT PANEL — 60% ══════ */}
      <div className="hidden lg:block relative flex-shrink-0" style={{ width: "60%" }}>

        {/* Background image — left aligned so condor is visible */}
        <div className="absolute inset-0" style={{
          backgroundImage: "url('/condor-login-screen-v1.png')",
          backgroundSize: "cover",
          backgroundPosition: "left center",
        }} />

        {/* Overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,6,8,0.3) 0%, transparent 35%, rgba(6,6,8,0.75) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(6,6,8,0.0) 0%, rgba(6,6,8,0.1) 50%, rgba(6,6,8,0.68) 100%)" }} />

        {/* ── LOGO — bottom left — BIGGER ── */}
        <div className="absolute bottom-10 left-8 flex items-center gap-3">
          {/* Container: 56×56px with frosted glass */}
          <div style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.28)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* Logo image: 38px so it fills the container */}
            <img src="/condor-logo-v1.png" alt="" width={38} height={38}
              style={{ objectFit: "contain", filter: "invert(1)", opacity: 0.93 }} />
          </div>
          <span style={{
            fontFamily: "var(--font-montserrat)", fontWeight: 800,
            fontSize: "0.9rem", letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.92)",
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}>
            CONDOR
          </span>
        </div>

        {/* ── TAGLINE — bottom right — BIGGER, SINGLE LINE ── */}
        <div className="absolute bottom-10 right-8" style={{ maxWidth: "340px", textAlign: "right" }}>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 600,
            /* +20% from original 1.9rem → 2.3rem max */
            fontSize: "clamp(1.75rem, 2.8vw, 2.3rem)",
            lineHeight: 1.25,
            letterSpacing: "-0.025em",
            textShadow: "0 2px 16px rgba(0,0,0,0.6)",
            color: C.white,
            /* NO <br> — single line */
            whiteSpace: "normal",
          }}>
            From data to{" "}
            <span style={{ color: C.grey, fontWeight: 600 }}>understanding.</span>
          </p>
          <p className="mt-2.5 leading-relaxed" style={{
            fontSize: "0.9rem",
            color: "rgba(253,253,253,0.48)",
            textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          }}>
            The B2B analytics platform for marketers<br />who need clarity, not complexity.
          </p>
        </div>
      </div>

      {/* ══════ RIGHT PANEL — 40% white ══════ */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}