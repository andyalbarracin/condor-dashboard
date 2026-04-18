# 🦅 CONDOR Analytics

## Current Version: 1.4.0

**Release Name:** Connected Foundation  
**Release Date:** April 16, 2026  
**Status:** Stable — Production (Asentria Internal) + SaaS Transformation In Progress

---

## Version Information

### Product Details
- **Name:** CONDOR Analytics
- **Tagline:** "CONDOR doesn't show metrics. CONDOR tells you what to do."
- **Type:** B2B Social Media Intelligence Platform
- **Target:** Marketing Managers, B2B Tech/Telecom companies in LATAM
- **Primary User:** Asentria Marketing Team (Andy)
- **Production URL:** https://condor-analytics.vercel.app
- **Repository:** https://github.com/andyalbarracin/condor-dashboard

### Technical Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 3 + shadcn/ui + Radix UI
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Charts:** Recharts 2.x
- **Animations:** framer-motion
- **Icons:** lucide-react
- **Parsing:** xlsx 0.18.x + papaparse 5.x
- **PDF Export:** jsPDF 2.x + jspdf-autotable
- **Deployment:** Vercel (auto-deploy from main branch)
- **Version Control:** Git + GitHub (HTTPS only)

### Supported Platforms
- ✅ LinkedIn (Content, Followers, Visitors — XLS export)
- ✅ Twitter / X (Content, Account Overview — CSV export)
- ✅ Google Analytics 4 (UTM Campaigns, Traffic Sources — CSV export)
- 🚧 Instagram (Planned — Phase 1B)
- 🚧 TikTok (Planned — Phase 1B)
- 🚧 Facebook Pages (Planned — Phase 1B, low priority)

### Supported Industries (Benchmarks)
Telecom / Network Infrastructure, SaaS, E-commerce, B2B Tech, Fintech, Healthcare, Finance, Manufacturing, Education, Media, Real Estate, Non-Profit, Hospitality, Energy

---

## Feature Status (v1.4.0)

### ✅ Core Analytics
| Feature | Status |
|---------|--------|
| LinkedIn Content/Followers/Visitors parsing (XLS) | ✅ Production |
| Twitter/X Content/Account Overview parsing (CSV) | ✅ Production |
| Google Analytics 4 UTM/Traffic parsing (CSV) | ✅ Production |
| Multi-dataset localStorage (5 independent slots) | ✅ Production |
| Overview Tab with sparklines + web snapshot | ✅ Production |
| Social Tab with Weekly Summary modal (6 slides) | ✅ Production |
| Web Tab with Traffic Summary modal (4 slides) | ✅ Production |
| Calendar Heatmap with drill-down | ✅ Production |
| Followers Chart with date range filtering | ✅ Production |
| Demographic Cards (location, job, industry, seniority) | ✅ Production |

### ✅ Reports & Export
| Feature | Status |
|---------|--------|
| Industry benchmarks (13 industries) | ✅ Production |
| Intelligent Recommendations (8 prioritized) | ✅ Production |
| PDF Export (professional format) | ✅ Production |
| Excel/CSV Export | ✅ Production |
| Benchmark comparison table | ✅ Production |

### ✅ UI/UX
| Feature | Status |
|---------|--------|
| Dark / Light mode | ✅ Production |
| Responsive design | ✅ Production |
| Persistent sidebar with tooltips (Radix UI) | ✅ Production |
| Pricing page (3 plans + trial) | ✅ Production |

### 🔄 In Progress (v2.0.0)
| Feature | Status |
|---------|--------|
| Supabase Auth (Google OAuth + email) | 🔄 Building |
| Onboarding flow (multi-step) | 🔄 Designing |
| User roles (user / admin / super_admin) | 🔄 Schema ready |
| Platform connections (GA4 OAuth, LinkedIn, X) | 🔄 Schema ready |
| localStorage → Supabase migration | 🔄 Planned |

---

## Database Schema (v2.1 — Current)

7 tables with Row Level Security:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends auth.users) |
| `subscriptions` | User plan + trial status |
| `subscription_plans` | Plan definitions (Starter, Professional, Agency, Enterprise) |
| `workspaces` | Companies/projects per user |
| `analytics_datasets` | Uploaded CSV/XLS data |
| `analytics_metrics` | Aggregated metrics for fast queries |
| `workspace_members` | Team collaboration (future) |
| `onboarding_responses` | Onboarding answers for product analytics |
| `platform_connections` | OAuth tokens for direct API connections |
| `audit_logs` | Immutable security audit trail |

---

## Pricing Model

| Plan | Emoji | Monthly | Annual/mo | Trial |
|------|-------|---------|-----------|-------|
| **Nest** | 🪺 | $19 | $15 | 30 days |
| **Flight** | 🦅 | $49 | $39 | 30 days |
| **Altitude** | 🌐 | $129 | $99 | 30 days |
| **Apex** | 🏔️ | From $199 | Custom | — |

**Plan philosophy:** Nest → Flight → Altitude → Apex (vision/flight naming).  
**No free tier.** 30-day trial with full Flight access. No credit card required.
---

## Version History

### v1.4.0 — April 16, 2026 — "Connected Foundation"
**SaaS Transformation Begins**
- Added Supabase schema v2.1 (7→10 tables with full RLS)
- Added `role` field to profiles (user / admin / super_admin)
- Added `onboarding_responses` table
- Added `platform_connections` table (OAuth foundation)
- Added `audit_logs` table (security/compliance)
- Created Pricing page with 3 plans + 30-day trial
- Complete market study and competitive analysis
- Design System documentation

### v1.3.0 — March 21, 2026 — "GA4 Integration Complete"
**Fixed 3 GA4 integration bugs + Overview redesign**
- Fixed: Tooltips invisible in Web tab (Radix UI portal-based solution)
- Fixed: Navigation locked when only GA4 data present
- Fixed: Social data destroyed when uploading GA4 data
- Added: Overview tab redesign with sparklines + web analytics snapshot
- Added: Web Traffic Summary modal (4 animated slides)
- Added: `WeeklySummaryHeader` flexible component (social/web/overview variants)
- Branches: backup-production-final-v1.4 created

### v1.2.0 — March 18, 2026 — "Google Analytics"
**GA4 CSV Integration**
- Added: Google Analytics CSV parser (UTM Campaigns + Traffic Sources)
- Added: Web tab with Campaign Performance table
- Added: Session source/medium breakdown charts
- Added: Sortable + filterable campaign table
- Technical: Radix UI Tooltip (portal-based, overflow-safe)

### v1.1.0 — February 2026 — "Multi-Dataset"
**Multi-platform data support**
- Added: Multi-dataset localStorage structure (5 independent slots)
- Added: LinkedIn Followers Analytics support (XLS)
- Added: LinkedIn Visitors Analytics support (XLS)
- Added: Twitter/X Account Overview support (CSV)
- Added: FollowersChart with date range filtering
- Added: Demographic Cards (location, job, industry, seniority, company size)
- Added: Weekly Summary modal (6 animated slides)
- Added: WeeklySummaryHeader component
- Fixed: Day-of-week timezone bug

### v1.0.0 — December 2025 — "MVP Launch"
**Initial production release**
- LinkedIn Content analytics (XLS)
- Twitter/X Content analytics (CSV)
- Dashboard tabs: Overview, Social, Web
- Calendar Heatmap with post drill-down
- KPI cards
- Reports page with industry benchmarks
- Intelligent Recommendations system (rule-based)
- PDF export (professional format)
- Excel/CSV export
- Dark/Light mode
- Responsive design + sidebar
- Deployment: Vercel

---

## Architecture Notes

### Data Flow (Current)
```
CSV/XLS Upload → universal-parser.ts → specific parser → 
NormalizedDataPoint[] → localStorage (MultiDataset) → 
app/page.tsx → OverviewTab / SocialTab / WebTab
```

### Data Flow (Target — v2.0.0)
```
CSV/XLS Upload → parser → Supabase analytics_datasets →
RLS-protected queries → Next.js RSC → Dashboard tabs
```

### File Structure
- No `/src` directory (Lovable-origin project, flat structure is correct)
- App Router (Next.js 14) — no Pages Router
- TypeScript strict mode — no `any`, no `@ts-ignore`
- Tailwind CSS — no CSS modules, no inline styles

### Key Learnings
- `overflow-x-auto` clips `position: absolute` tooltips — always use Radix UI portal
- GA4 data must be routed by `source === 'google-analytics'` BEFORE subType switch
- LinkedIn XLS files have row 1 as description, dynamic header detection required
- SSH port 22 blocked in Andy's network — always use HTTPS for git

---

## Performance Benchmarks
- **Build time:** ~45 seconds
- **Bundle size:** ~850 KB
- **Lighthouse scores:** 90+ (Performance, Accessibility, Best Practices, SEO)
- **Time to Interactive:** <2 seconds
- **Browser support:** Chrome, Firefox, Safari, Edge (latest)

---

## Development Rules (for AI assistants and new devs)

1. Always ask to see files before writing code
2. Deliver complete files only — no snippets
3. Include file headers (path, date, description)
4. No unsolicited refactoring
5. TypeScript strict — no `any`, no `@ts-ignore`
6. Test instructions with every delivery
7. Backup branches before big changes
8. HTTPS only for git (SSH port blocked)
9. Stability > new features > cosmetic fixes

---

**Maintained by:** Andy (Product Owner) + Claude (AI Development Partner)  
**Last Updated:** April 16, 2026