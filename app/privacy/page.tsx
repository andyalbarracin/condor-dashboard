/**
 * File: page.tsx
 * Path: /app/privacy/page.tsx
 * Last Modified: 2026-04-17
 * Description: Privacy Policy placeholder page.
 *   TODO: Replace with reviewed legal text before public launch.
 */

import Link from "next/link"

const C = { carbon: "#212121", grey: "#818181", alabaster: "#e0e0e0" }

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly (name, email, company details during signup and onboarding), analytics data you upload (LinkedIn, X, Google Analytics CSV/XLS files), and usage data (pages visited, features used, actions taken within the platform).",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use the information we collect to provide and improve the CONDOR Analytics service, to personalise your dashboard and benchmark recommendations, to send transactional emails (account creation, password reset, trial reminders), and to analyse aggregate usage patterns to improve the product.",
  },
  {
    title: "3. Data Storage and Security",
    body: "Your data is stored securely using Supabase (PostgreSQL with Row-Level Security). Analytics files are processed and stored in your personal workspace, accessible only to you. We use HTTPS for all data transmission. Passwords are never stored in plain text.",
  },
  {
    title: "4. Data Sharing",
    body: "We do not sell, rent, or share your personal data with third parties for marketing purposes. We may share anonymised, aggregate usage statistics internally for product improvement. We use Supabase as our infrastructure provider, subject to their own privacy policy.",
  },
  {
    title: "5. Analytics Data You Upload",
    body: "The CSV and XLS files you upload (LinkedIn, X, Google Analytics exports) remain your property. CONDOR processes them to generate insights and visualisations. This data is stored in your account and is not accessed by CONDOR staff except to resolve technical issues at your request.",
  },
  {
    title: "6. Cookies",
    // TODO: Update with actual cookie list when implemented
    body: "CONDOR uses minimal cookies for session management and authentication (provided by Supabase Auth). We do not use advertising cookies or third-party tracking pixels at this time.",
  },
  {
    title: "7. Your Rights",
    body: "You have the right to access, correct, or delete your personal data at any time. You can update your profile information in Settings. To request account deletion and data removal, contact us at support@condoranalytics.app. We will process your request within 30 days.",
  },
  {
    title: "8. Data Retention",
    body: "We retain your data for as long as your account is active. If you cancel your subscription, your data is preserved for 30 days before deletion. Analytics data you upload can be deleted at any time from the dashboard.",
  },
  {
    title: "9. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of material changes via email or a notice in the platform. Continued use of CONDOR after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "10. Contact",
    // TODO: Update with verified contact details before launch
    body: "For privacy-related questions, contact us at privacy@condoranalytics.app or through our Support page.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header style={{ borderBottom: `1px solid ${C.alabaster}` }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#f3f3f3" }}>
              <img src="/condor-logo-v1.png" alt="" width={22} height={22} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
            </div>
            <span style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.18em", color: C.carbon }}>CONDOR</span>
          </Link>
          <Link href="/auth/login" className="text-sm font-medium" style={{ color: C.grey }}>Sign in</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-12">
          <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: C.grey, marginBottom: "0.6rem" }}>Legal</p>
          <h1 style={{ fontFamily: "var(--font-montserrat)", fontWeight: 700, fontSize: "2rem", color: C.carbon, letterSpacing: "-0.02em" }}>
            Privacy Policy
          </h1>
          <p className="text-sm mt-2" style={{ color: C.grey }}>Last updated: April 17, 2026</p>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-700 leading-relaxed">
              <span className="font-semibold">Note:</span> This policy is in draft form and will be finalised before public launch.
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-10" style={{ color: C.grey }}>
          This Privacy Policy describes how CONDOR Analytics ("CONDOR", "we", "us") collects, uses, and protects
          information about users of our platform. By using CONDOR you agree to this policy.
        </p>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <div key={section.title} className="border-b pb-8 last:border-0" style={{ borderColor: C.alabaster }}>
              <h2 className="mb-2.5" style={{ fontFamily: "var(--font-montserrat)", fontWeight: 600, fontSize: "1rem", color: C.carbon }}>
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: C.grey }}>{section.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${C.alabaster}` }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between" style={{ fontSize: "0.68rem", color: "#bbb" }}>
          <span>CONDOR Analytics © 2026 — All rights reserved</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-neutral-600 transition-colors">Terms of Use</Link>
            <Link href="/support" className="hover:text-neutral-600 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}