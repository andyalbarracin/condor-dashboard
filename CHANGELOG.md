# Changelog

All notable changes to CONDOR Analytics will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-01-22

### Added
- Interactive tooltips on collapsed sidebar navigation for improved UX
- Persistent sidebar state across page navigation using localStorage
- Enhanced mobile and compact display support
- Smooth sidebar transitions with intelligent rendering

### Fixed
- Sidebar unexpectedly expanding when navigating to Reports, Uploads, or Settings pages
- React hydration mismatch errors in production builds
- Visual flicker effect during page transitions
- State persistence issues across different route types (tabs vs full navigation)

### Changed
- Product name simplified to "CONDOR Analytics" (removed "Dashboard")
- Updated branding across header, footer, and documentation
- Improved tooltip positioning and delay timing (300ms)

### Technical
- Implemented `useSidebarState` custom hook with localStorage persistence
- Synchronized localStorage reads in useState initializer to eliminate render flicker
- Added `suppressHydrationWarning` for SSR/Client consistency
- Optimized tooltip rendering with conditional display instead of conditional rendering

---

## [1.1.0] - 2026-01-20

### Added
- **Intelligent Recommendations System** with 3-tier priority levels (High/Medium/Low)
- Content pattern analysis detecting:
  - Questions & Problem Framing
  - Direct Call-to-Action
  - Problem-Focused Content
  - Technical Deep-Dives
- Actionable steps in each recommendation
- Data source citations in all recommendations
- Best posting day analysis based on historical performance

### Improved
- PDF export now includes intelligent recommendations with priority badges
- Enhanced benchmark comparison tooltips with detailed context
- Top content performance tracking with sortable columns
- Professional PDF formatting with colored priority indicators

### Fixed
- PDF "Avg Engagements" displaying incorrect percentage values
- TypeScript type errors in content analyzer
- Missing function exports in benchmark calculator

---

## [1.0.0] - 2025-12-22

### Added - Initial Release
- Multi-platform analytics support:
  - LinkedIn Content Analytics (XLS/XLSX)
  - LinkedIn Followers Analytics
  - LinkedIn Visitors Analytics
  - Twitter/X Analytics (CSV)
  - Google Analytics 4 Traffic Acquisition
- Benchmark comparisons across 13 industries:
  - Technology, B2B, E-commerce, Healthcare, Finance
  - Manufacturing, Education, Media, Real Estate
  - Non-Profit, Hospitality, Energy, Telecommunications
- Dashboard with 3 main tabs:
  - Overview: Unified metrics across platforms
  - Social: Detailed social media analytics
  - Web: Google Analytics insights
- Data visualization:
  - Calendar heatmap with engagement tracking
  - Platform breakdown pie charts
  - Engagement over time line charts
  - Top content performance tables
- Demographic analytics:
  - Follower location, job function, industry
  - Seniority levels and company size
  - Visitor demographics tracking
- Export functionality:
  - Professional PDF reports with benchmarks
  - Excel export for top content
  - Automatic filename generation
- File parsing system:
  - Automatic format detection
  - Dynamic header mapping
  - Data normalization across platforms
  - Duplicate detection and removal
- Real-time KPI cards:
  - Total posts, impressions, engagements
  - Average engagement rate
  - Platform-specific metrics
- localStorage-based data persistence
- Dark mode support via next-themes
- Responsive design with Tailwind CSS

### Technical Stack
- Next.js 14 with App Router
- React 18 with TypeScript 5
- Supabase for future database integration
- Recharts for data visualization
- jsPDF for PDF generation
- xlsx & papaparse for file parsing
- shadcn/ui components
- Tailwind CSS for styling

---

## [Unreleased]

### Planned for v1.3.0
- [ ] Visitor Location Map with interactive visualization (Leaflet/Mapbox)
- [ ] Instagram parser and benchmarks integration
- [ ] TikTok analytics support
- [ ] Enhanced Google Analytics integration

### Planned for v2.0.0 (SaaS Release)
- [ ] Multi-user authentication (Supabase Auth)
- [ ] Team collaboration features
- [ ] Role-based access control
- [ ] White-label reporting
- [ ] API access for integrations
- [ ] Automated scheduled reports
- [ ] Real-time data sync
- [ ] Advanced AI-powered insights
- [ ] Custom dashboard builder
- [ ] Revenue attribution tracking

---

## Version History

- **v1.2.0** - UX improvements and navigation fixes
- **v1.1.0** - Intelligent recommendations system
- **v1.0.0** - Initial stable release

---

## Notes

### Versioning Strategy
- **Major (X.0.0)**: Breaking changes, major feature overhauls, architecture changes
- **Minor (1.X.0)**: New features, significant improvements, backwards compatible
- **Patch (1.2.X)**: Bug fixes, minor improvements, no new features

### Branch Strategy
- `main`: Production-ready code (Asentria internal use)
- `develop`: Integration branch for next release
- `feature/*`: Feature development branches
- `hotfix/*`: Emergency fixes for production
- `saas/*`: SaaS public release development

### Contributing
For bug reports or feature requests, please contact the development team.

---

**Last Updated:** January 22, 2026  
**Maintained by:** Asentria Development Team