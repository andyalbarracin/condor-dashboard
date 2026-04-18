/**
 * File: client.ts
 * Path: /lib/supabase/client.ts
 * Last Modified: 2026-04-16
 * Description: Supabase browser client factory.
 *              Used in Client Components ("use client").
 *              Includes Google OAuth helper for one-click sign-in.
 *              Do NOT use this in Server Components or Route Handlers — use server.ts instead.
 */

import { createBrowserClient } from "@supabase/ssr"

/**
 * Creates a Supabase client for use in browser (Client Components).
 * Call this function inside components/hooks — do not create it at module level.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Sign in with Google OAuth.
 * Redirects the user to Google's consent screen.
 * After consent, Google redirects to /auth/callback which exchanges the code.
 *
 * Prerequisites in Supabase Dashboard:
 *   Authentication → Providers → Google → Enable
 *   Paste your Google Cloud Client ID and Secret
 *
 * @param redirectTo - Optional path to redirect after successful login (default: "/")
 */
export async function signInWithGoogle(redirectTo: string = "/") {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) throw error
}

/**
 * Sign out the current user and redirect to login page.
 */
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = "/auth/login"
}

/**
 * Get the current session client-side.
 * Returns null if not authenticated.
 */
export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}