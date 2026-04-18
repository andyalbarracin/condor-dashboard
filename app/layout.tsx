/**
 * File: layout.tsx
 * Path: /app/layout.tsx
 * Last Modified: 2026-04-17
 * Description: Root layout. Added Montserrat for display headings (auth/landing),
 *              Outfit for UI, DM Sans for body. Favicon metadata via Next.js API.
 */

import type React from "react"
import type { Metadata } from "next"
import { Outfit, DM_Sans, Montserrat } from "next/font/google"
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

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "CONDOR Analytics",
  description: "B2B social media intelligence. From data to understanding.",
  applicationName: "Condor",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-background text-foreground ${outfit.variable} ${dmSans.variable} ${montserrat.variable}`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" storageKey="condor-theme">
          <div className="flex min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}