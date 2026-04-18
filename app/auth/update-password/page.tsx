/**
 * File: page.tsx
 * Path: /app/auth/update-password/page.tsx
 * Last Modified: 2026-04-17
 * Description: New password screen. Reached via the link in the reset email.
 *              Supabase auto-authenticates the user via the URL token.
 *              Calls supabase.auth.updateUser({ password }) to set new password.
 *              Redirects to / on success.
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push("/"), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left image panel */}
      <div className="hidden lg:block relative flex-shrink-0" style={{ width: "42%" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "url('/condor-login-screen-v1.png')", backgroundSize: "cover", backgroundPosition: "left center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,12,0.45) 0%, transparent 30%, transparent 55%, rgba(8,8,12,0.82) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 55%, rgba(8,8,12,0.5) 100%)" }} />
        <div className="absolute bottom-10 left-8 right-8">
          <p style={{ fontFamily: "var(--font-montserrat)", fontWeight: 600, fontSize: "clamp(1.5rem,2.4vw,2.2rem)", color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em", lineHeight: 1.25, textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
            A fresh start<br />
            <span style={{ fontWeight: 700, color: "#f5a020" }}>awaits you.</span>
          </p>
        </div>
      </div>

      {/* Right white panel */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        {/* Logo bar */}
        <div className="flex items-center px-8 lg:px-10 pt-7 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <Image src="/condor-logo-v1.png" alt="CONDOR" width={28} height={28} className="object-contain" style={{ mixBlendMode: "multiply" }} />
            </div>
            <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.18em", color: "#1a1a1a" }}>CONDOR</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 lg:px-12">
          <div className="w-full max-w-sm">

            {success ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "1.4rem", color: "#111" }}>
                    Password updated
                  </h2>
                  <p className="text-sm mt-2" style={{ color: "#888" }}>
                    Redirecting you to the dashboard…
                  </p>
                </div>
                <div className="h-1 rounded-full bg-neutral-100 overflow-hidden">
                  <div className="h-1 rounded-full animate-[grow_2.5s_linear_forwards]" style={{ background: "linear-gradient(to right, #c44a00, #f5a020)" }} />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "1.55rem", color: "#111", letterSpacing: "-0.02em" }}>
                    Set a new password
                  </h1>
                  <p className="text-sm mt-2" style={{ color: "#888" }}>
                    Must be at least 8 characters.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 text-sm rounded-xl px-4 py-3 border border-red-200 bg-red-50 text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">New password</label>
                    <div className="relative">
                      <Input
                        id="password" type={showPassword ? "text" : "password"} placeholder="minimum 8 characters"
                        required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading} className="h-11 rounded-xl border-neutral-200 bg-white text-sm pr-10"
                        style={{ color: "#111" }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirm" className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Confirm password</label>
                    <Input
                      id="confirm" type="password" placeholder="repeat password"
                      required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading} className="h-11 rounded-xl border-neutral-200 bg-white text-sm"
                      style={{ color: "#111" }}
                    />
                  </div>

                  <button type="submit" disabled={isLoading}
                    className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #c44a00 0%, #f5a020 100%)" }}
                  >
                    {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : "Update password →"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm">
                  <Link href="/auth/login" className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    Back to sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 lg:px-10 py-4 flex-shrink-0 border-t border-neutral-100" style={{ fontSize: "0.7rem", color: "#aaa" }}>
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