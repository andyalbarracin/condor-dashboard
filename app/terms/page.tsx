/**
 * File: page.tsx
 * Path: /app/terms/page.tsx
 * Last Modified: 2026-04-17
 * Description: Terms of Use placeholder page.
 *              Professional structure ready to be filled with legal copy.
 *              Sections: Introduction, Acceptance, Service Description,
 *              User Obligations, Intellectual Property, Limitation of Liability,
 *              Governing Law, Contact.
 *              TODO: Replace placeholder copy with reviewed legal text.
 */

import Link from "next/link"
import Image from "next/image"

// TODO: Replace with actual legal text reviewed by counsel
const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using CONDOR Analytics (the 'Service'), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.",
  },
  {
    title: "2. Description of Service",
    body: "CONDOR Analytics provides a B2B social media and web analytics dashboard that allows users to upload, process, and visualize data from platforms including LinkedIn, Twitter/X, and Google Analytics 4. The Service is provided on a subscription basis with a 30-day free trial.",
  },
  {
    title: "3. User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. CONDOR Analytics is not liable for any loss resulting from unauthorized use of your account.",
  },
  {
    title: "4. Data and Privacy",
    body: "Your use of the Service is also governed by our Privacy Policy. By using CONDOR Analytics, you consent to the collection, use, and storage of your data as described therein. You retain ownership of all data you upload to the Service.",
  },
  {
    title: "5. Acceptable Use",
    body: "You agree not to misuse the Service or help anyone else do so. Prohibited activities include attempting to reverse-engineer the platform, uploading malicious content, using the Service to violate applicable laws, or reselling access without authorization.",
  },
  {
    title: "6. Intellectual Property",
    body: "All intellectual property rights in the Service, including software, design, and trademarks, belong to CONDOR Analytics and its licensors. Nothing in these Terms grants you any rights to use our trademarks or branding without prior written consent.",
  },
  {
    title: "7. Limitation of Liability",
    // TODO: Review this clause with legal counsel before production launch
    body: "To the maximum extent permitted by law, CONDOR Analytics shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.",
  },
  {
    title: "8. Termination",
    body: "We reserve the right to suspend or terminate your account at our discretion if you breach these Terms. Upon termination, your right to use the Service ceases immediately. Your data will be retained for 30 days following termination before deletion.",
  },
  {
    title: "9. Governing Law",
    // TODO: Confirm jurisdiction with legal counsel
    body: "These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts.",
  },
  {
    title: "10. Changes to Terms",
    body: "We may update these Terms from time to time. We will notify you of material changes via email or a prominent notice in the Service. Your continued use after changes constitutes acceptance of the new terms.",
  },
  {
    title: "11. Contact",
    body: "For questions about these Terms, please contact us at legal@condoranalytics.app or through our Support page.",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-100 px-6 lg:px-10 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <Image src="/condor-logo-v1.png" alt="CONDOR" width={24} height={24} className="object-contain" style={{ mixBlendMode: "multiply" }} />
            </div>
            <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.18em", color: "#1a1a1a" }}>
              CONDOR
            </span>
          </Link>
          <Link href="/auth/login" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 lg:px-10 py-12 lg:py-16">

        {/* Page header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Legal</p>
          <h1
            style={{
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              fontSize: "2rem",
              color: "#111",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Terms of Use
          </h1>
          <p className="text-sm text-neutral-500 mt-3">
            Last updated: April 17, 2026
          </p>

          {/* TODO: Update effective date before public launch */}
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-700 leading-relaxed">
              <span className="font-semibold">Note:</span> These terms are currently in draft form
              and will be finalized before the public launch of CONDOR Analytics.
            </p>
          </div>
        </div>

        {/* Intro */}
        <p className="text-sm text-neutral-600 leading-relaxed mb-10">
          These Terms of Use ("Terms") govern your access to and use of CONDOR Analytics, a product of
          Asentria. Please read them carefully before using the Service.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="border-b border-neutral-100 pb-8 last:border-0">
              <h2
                className="mb-3"
                style={{
                  fontFamily: "var(--font-montserrat)",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#1a1a1a",
                  letterSpacing: "-0.01em",
                }}
              >
                {section.title}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 px-6 lg:px-10 py-5 mt-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between" style={{ fontSize: "0.7rem", color: "#aaa" }}>
          <span>CONDOR Analytics © 2026 — All rights reserved</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-neutral-700 font-medium">Terms of Use</Link>
            <Link href="/support" className="hover:text-neutral-600 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}