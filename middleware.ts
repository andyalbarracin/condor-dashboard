/**
 * File: middleware.ts
 * Path: /middleware.ts
 * Last Modified: 2026-04-16
 * Description: Next.js middleware for Supabase session management and route protection.
 *              Handles:
 *                - Session refresh (required for Supabase SSR)
 *                - Auth protection: redirects unauthenticated users to /auth/login
 *                - Auth bypass: redirects authenticated users away from /auth/* pages
 *              NOTE: Onboarding redirect is handled in the dashboard layout (not here)
 *              to avoid extra DB queries on every request.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

// Routes that require authentication
const PROTECTED_PATHS = ["/", "/reports", "/upload", "/settings", "/onboarding", "/admin"]

// Routes that are only for unauthenticated users (redirect to / if logged in)
const AUTH_ONLY_PATHS = ["/auth/login", "/auth/sign-up"]

// Fully public routes (no auth logic applied)
const PUBLIC_PATHS = [
  "/pricing",
  "/auth/callback",
  "/auth/confirm",
  "/auth/sign-up-success",
  "/api/public",
]

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )
}

function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options ?? {})
          )
        },
      },
    }
  )

  // CRITICAL: Always call getUser() to refresh the session token.
  // Do not remove this — it keeps server-side sessions alive.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 1. Skip public paths — no auth logic needed
  if (isPublicPath(pathname)) {
    return supabaseResponse
  }

  // 2. Unauthenticated user trying to access a protected route
  if (!user && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/auth/login"
    // Preserve the intended destination for post-login redirect
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // 3. Authenticated user trying to access auth-only pages (login/signup)
  if (user && isAuthOnlyPath(pathname)) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = "/"
    homeUrl.search = ""
    return NextResponse.redirect(homeUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static (Next.js static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Static image files (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
}