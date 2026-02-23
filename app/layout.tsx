/**
 * File: layout.tsx
 * Path: /app/layout.tsx
 * Last Modified: 2026-02-02
 * Description: Root layout con ThemeProvider y fuentes Outfit + DM Sans para Weekly Summary
 */

import type React from "react"
import type { Metadata } from "next"
import { Outfit, DM_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "CONDOR Dashboard",
  description: "Analytics dashboard for social media and web metrics",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`bg-background text-foreground ${outfit.variable} ${dmSans.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" storageKey="condor-theme">
          <div className="flex min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}