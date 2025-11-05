import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "next-themes"

export const metadata: Metadata = {
  title: "CONDOR Dashboard",
  description: "Analytics dashboard for social media and web metrics",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" storageKey="condor-theme">
          <div className="flex min-h-screen">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}
