/**
 * File: page.tsx
 * Path: /app/auth/sign-up/page.tsx
 * Last Modified: 2026-04-17
 * Description: "Everything in your 30-day trial" — bigger font, single line.
 *   Beta: no email confirmation required.
 */

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient, signInWithGoogle } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Check } from "lucide-react"

const C = {
  orange: "#ef7800", orangeDark: "#c44a00",
  carbon: "#212121", grey: "#818181", alabaster: "#e0e0e0", white: "#fdfdfd",
}

const TRIAL_ITEMS = [
  "Full Flight plan · 30 days free",
  "LinkedIn, X & Google Analytics 4",
  "Industry benchmarks by sector",
  "Intelligent Recommendations engine",
  "Weekly & Traffic Summary reports",
  "No credit card required",
]

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) { setError("Passwords do not match."); return }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }

    const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError
      if (signUpData.session) { router.push("/onboarding"); return }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        if (signInError.message.toLowerCase().includes("not confirmed")) {
          setError("Email confirmation is enabled in Supabase. Disable it: Dashboard → Authentication → Email → uncheck \"Confirm email\".")
          return
        }
        throw signInError
      }
      router.push("/onboarding")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred"
      if (message.includes("already registered") || message.includes("User already registered")) {
        setError("This email is already in use. Try signing in instead.")
      } else { setError(message) }
    } finally { setIsLoading(false) }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true); setError(null)
    try { await signInWithGoogle("/onboarding") }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Google sign-up failed"); setIsGoogleLoading(false) }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">

      {/* LEFT image panel */}
      <div className="hidden lg:block relative flex-shrink-0" style={{ width: "60%" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "url('/condor-login-screen-v1.png')", backgroundSize: "cover", backgroundPosition: "left center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,6,8,0.3) 0%, transparent 35%, rgba(6,6,8,0.85) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(6,6,8,0.0) 0%, rgba(6,6,8,0.1) 50%, rgba(6,6,8,0.68) 100%)" }} />

        {/* Logo — bigger — bottom left */}
        <div className="absolute bottom-10 left-8 flex items-center gap-3">
          <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/condor-logo-v1.png" alt="" width={38} height={38} style={{ objectFit: "contain", filter: "invert(1)", opacity: 0.93 }} />
          </div>
          <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.22em", color: "rgba(255,255,255,0.92)" }}>CONDOR</span>
        </div>

        {/* Trial features — bottom right — MUCH BIGGER */}
        <div className="absolute bottom-10 right-8" style={{ maxWidth: "340px", textAlign: "right" }}>
          {/* "Everything in your 30-day trial" — big Montserrat, single line */}
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 2.8vw, 2.3rem)",
            color: C.white,
            lineHeight: 1.25,
            letterSpacing: "-0.025em",
            textShadow: "0 2px 16px rgba(0,0,0,0.6)",
          }}>
            Everything in your{" "}
            <span style={{ color: C.grey }}>30-day trial</span>
          </p>
          {/* Feature list */}
          <ul className="mt-5 space-y-2.5 inline-block text-left">
            {TRIAL_ITEMS.map(item => (
              <li key={item} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: C.orange }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "rgba(253,253,253,0.72)" }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT white form */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        <div className="flex items-center justify-between px-8 lg:px-10 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f3f3f3" }}>
              <img src="/condor-logo-v1.png" alt="" width={26} height={26} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
            </div>
            <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.2em", color: C.carbon }}>CONDOR</span>
          </div>
          <p className="text-xs" style={{ color: C.grey }}>
            Have an account?{" "}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: C.carbon }}>Sign in</Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 lg:px-10">
          <div className="w-full max-w-[320px]">
            <div className="mb-7">
              <h1 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "1.45rem", color: C.carbon, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Create your account</h1>
              <p className="text-sm mt-1.5" style={{ color: C.grey }}>30-day free trial · No credit card required</p>
            </div>

            {error && <div className="mb-5 text-sm rounded-xl px-4 py-3 border border-red-200 bg-red-50 text-red-600 leading-relaxed">{error}</div>}

            <button type="button" onClick={handleGoogleSignUp} disabled={isGoogleLoading || isLoading}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 mb-4"
              style={{ background: C.carbon, color: "#fff" }}>
              {isGoogleLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : (
                <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: C.alabaster }} /></div>
              <div className="relative flex justify-center"><span className="bg-white px-3 text-xs" style={{ color: C.grey }}>or sign up with email</span></div>
            </div>

            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.grey }}>Email</label>
                <Input type="email" placeholder="you@company.com" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading || isGoogleLoading} className="h-11 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.grey }}>Password</label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="8+ characters" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading || isGoogleLoading} className="h-11 rounded-xl text-sm pr-10" style={{ borderColor: C.alabaster, color: C.carbon }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.grey }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.grey }}>Confirm password</label>
                <Input type="password" placeholder="Repeat password" required autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isLoading || isGoogleLoading} className="h-11 rounded-xl text-sm" style={{ borderColor: C.alabaster, color: C.carbon }} />
              </div>
              <button type="submit" disabled={isLoading || isGoogleLoading}
                className="w-full h-11 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 border"
                style={{ background: "transparent", borderColor: C.carbon, color: C.carbon }}>
                {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-800" /> : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-relaxed" style={{ color: "#bbb" }}>
              By creating an account you agree to our{" "}
              <Link href="/terms" className="hover:underline underline-offset-2" style={{ color: C.grey }}>Terms</Link>{" "}and{" "}
              <Link href="/privacy" className="hover:underline underline-offset-2" style={{ color: C.grey }}>Privacy Policy</Link>.
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
    </div>
  )
}