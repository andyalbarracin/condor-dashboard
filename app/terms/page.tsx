/**
 * File: page.tsx
 * Path: /app/terms/page.tsx
 * Last Modified: 2026-04-19
 * Fix: Auth-aware header (Back to dashboard if logged in, Sign in if not).
 *   Same max-w-screen-2xl mx-auto layout as Pricing.
 */

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms", body: "By accessing or using CONDOR Analytics (the 'Service'), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service." },
  { id: "description", title: "2. Description of Service", body: "CONDOR Analytics provides a B2B social media and web analytics dashboard that allows users to upload, process, and visualize data from platforms including LinkedIn, Twitter/X, and Google Analytics 4. The Service is provided on a subscription basis with a 30-day free trial. CONDOR is developed by Asentria." },
  { id: "accounts", title: "3. User Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. CONDOR Analytics is not liable for any loss resulting from unauthorized use of your account." },
  { id: "data", title: "4. Data and Privacy", body: "Your use of the Service is also governed by our Privacy Policy. By using CONDOR Analytics, you consent to the collection, use, and storage of your data as described therein. You retain ownership of all analytics data you upload to the Service." },
  { id: "use", title: "5. Acceptable Use", body: "You agree not to misuse the Service or help anyone else do so. Prohibited activities include attempting to reverse-engineer the platform, uploading malicious content, using the Service to violate applicable laws, or reselling access without authorization." },
  { id: "ip", title: "6. Intellectual Property", body: "All intellectual property rights in the Service, including software, design, and trademarks, belong to CONDOR Analytics and its licensors. Nothing in these Terms grants you any rights to use our trademarks or branding without prior written consent." },
  { id: "liability", title: "7. Limitation of Liability", body: "To the maximum extent permitted by law, CONDOR Analytics shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim." },
  { id: "termination", title: "8. Termination", body: "We reserve the right to suspend or terminate your account at our discretion if you breach these Terms. Upon termination, your right to use the Service ceases immediately. Your data will be retained for 30 days following termination before deletion." },
  { id: "law", title: "9. Governing Law", body: "These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts." },
  { id: "changes", title: "10. Changes to Terms", body: "We may update these Terms from time to time. We will notify you of material changes via email or a prominent notice in the Service. Your continued use after changes constitutes acceptance of the new terms." },
  { id: "contact", title: "11. Contact", body: "For questions about these Terms, please contact us at legal@condoranalytics.app or through our Support page." },
]

export default function TermsPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    check()
  }, [])

  return (
    <div className="min-h-screen bg-background">

      <header className="border-b border-border bg-background">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <img src="/condor-logo-v1.png" alt="CONDOR" width={24} height={24}
                className="object-contain" style={{ mixBlendMode: "multiply" }} />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-foreground"
              style={{ fontFamily: "var(--font-montserrat)" }}>CONDOR</span>
          </Link>

          {isLoggedIn === null ? null : isLoggedIn ? (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <Link href="/auth/login" className="text-sm text-neutral-500 hover:text-foreground transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-12">

          <aside className="lg:w-64 xl:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Legal</p>
              <h1 className="text-2xl font-bold text-foreground mb-1"
                style={{ fontFamily: "var(--font-montserrat)", letterSpacing: "-0.02em" }}>
                Terms of Use
              </h1>
              <p className="text-xs text-neutral-500 mb-6">Last updated: April 17, 2026</p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-3 py-2.5 mb-6">
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  <span className="font-semibold">Draft.</span> Will be finalised before public launch.
                </p>
              </div>
              <nav className="hidden lg:block space-y-1">
                {SECTIONS.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                    className="block text-xs text-neutral-500 hover:text-foreground py-1 transition-colors leading-relaxed">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-10 max-w-prose">
              These Terms of Use ("Terms") govern your access to and use of CONDOR Analytics,
              a product of Asentria. Please read them carefully before using the Service.
            </p>
            <div className="space-y-10">
              {SECTIONS.map(section => (
                <div key={section.id} id={section.id} className="border-b border-border pb-10 last:border-0 scroll-mt-24">
                  <h2 className="mb-3 text-foreground"
                    style={{ fontFamily: "var(--font-montserrat)", fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.01em" }}>
                    {section.title}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </main>

        </div>
      </div>

      <footer className="border-t border-border">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-12 py-4 flex items-center justify-between"
          style={{ fontSize: "0.7rem", color: "#aaa" }}>
          <span>CONDOR Analytics © 2026 — All rights reserved</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}