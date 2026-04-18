/**
 * File: page.tsx
 * Path: /app/auth/forgot-password/page.tsx
 * Last Modified: 2026-04-17
 * Description: Forgot password flow using Supabase Auth.
 *              Calls supabase.auth.resetPasswordForEmail(email, { redirectTo }).
 *              Redirects user to /auth/update-password after clicking email link.
 *              Matches login white-panel aesthetic.
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mail } from "lucide-react"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">

      {/* Left panel — image, same as login */}
      <div className="hidden lg:block relative flex-shrink-0" style={{ width: "42%" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "url('/condor-login-screen-v1.png')", backgroundSize: "cover", backgroundPosition: "left center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,12,0.45) 0%, transparent 30%, transparent 55%, rgba(8,8,12,0.82) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 55%, rgba(8,8,12,0.5) 100%)" }} />
        <div className="absolute bottom-10 left-8 right-8">
          <p style={{ fontFamily: "var(--font-montserrat)", fontWeight: 600, fontSize: "clamp(1.5rem,2.4vw,2.2rem)", color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em", lineHeight: 1.25, textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
            We&apos;ll get you<br />
            <span style={{ fontWeight: 700, color: "#f5a020" }}>back in.</span>
          </p>
        </div>
      </div>

      {/* Right panel — white */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center px-8 lg:px-10 pt-7 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <Image src="/condor-logo-v1.png" alt="CONDOR" width={28} height={28} className="object-contain" style={{ mixBlendMode: "multiply" }} />
            </div>
            <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.18em", color: "#1a1a1a" }}>CONDOR</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-12">
          <div className="w-full max-w-sm">

            {!sent ? (
              <>
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-8">
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>

                <div className="mb-8">
                  <h1 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "1.55rem", color: "#111", letterSpacing: "-0.02em" }}>
                    Reset your password
                  </h1>
                  <p className="text-sm mt-2" style={{ color: "#888" }}>
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 text-sm rounded-xl px-4 py-3 border border-red-200 bg-red-50 text-red-600">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Email address</label>
                    <Input
                      id="email" type="email" placeholder="johndoe@mail.com" required
                      value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                      className="h-11 rounded-xl border-neutral-200 bg-white text-sm" style={{ color: "#111" }}
                    />
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(135deg, #c44a00 0%, #f5a020 100%)" }}
                  >
                    {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : "Send reset link →"}
                  </button>
                </form>
              </>
            ) : (
              /* Email sent confirmation */
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-neutral-500" />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "1.4rem", color: "#111" }}>
                    Check your inbox
                  </h2>
                  <p className="text-sm mt-2" style={{ color: "#888" }}>
                    A reset link was sent to{" "}
                    <span className="font-semibold text-neutral-700">{email}</span>
                  </p>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Click the link in the email to set a new password. Check spam if you don&apos;t see it.
                </p>
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
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