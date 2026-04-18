/**
 * File: route.ts
 * Path: /app/auth/callback/route.ts
 * Last Modified: 2026-04-16
 * Description: OAuth callback handler for Supabase authentication.
 *              Handles the code exchange after Google OAuth (or any OAuth provider).
 *              After successful exchange:
 *                - New users → /onboarding
 *                - Existing users with completed onboarding → / (or ?next= param)
 *                - Failure → /auth/login?error=auth_failed
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const error = searchParams.get("error")

  // Handle OAuth errors (e.g. user denied access)
  if (error) {
    console.error("[Auth Callback] OAuth error:", error)
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error)}`
    )
  }

  if (!code) {
    console.error("[Auth Callback] No code in request")
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Exchange the code for a session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error("[Auth Callback] Code exchange error:", exchangeError.message)
    return NextResponse.redirect(
      `${origin}/auth/login?error=auth_failed`
    )
  }

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_user`)
  }

  // Check if this user has completed onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single()

  // New user or incomplete onboarding → go to /onboarding
  if (!profile?.onboarding_completed) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  // Existing user → go to intended destination or home
  const safeNext = next.startsWith("/") ? next : "/"
  return NextResponse.redirect(`${origin}${safeNext}`)
}