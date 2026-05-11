---
name: Condor Project State
description: Stack, implemented features, DB schema, Content Deck modules, SQL migrations, MCP setup
type: project
---

## Stack
- Next.js 14 App Router, TypeScript strict, Tailwind, shadcn/ui, Radix UI
- Supabase (auth + DB + storage)
- Key packages: xlsx, papaparse, @dnd-kit/core, date-fns, lucide-react, recharts

## Routes
- `/` — Analytics dashboard (social/web tabs)
- `/upload` — Data upload
- `/reports` — Reports
- `/settings` — Settings
- `/content` → redirects to `/content/pipeline` — Old content module (Kanban/Table/Calendar)
- `/content-deck` — **New Monday-style board module** (v2.0, 2026-05-08)
- `/pricing`, `/admin`, `/onboarding`

## DB Schema (key tables)
- `workspaces`, `workspace_members`, `profiles`
- `analytics_datasets`, `analytics_posts`
- `content_items`, `content_versions`, `content_comments`, `content_attachments`, `content_activity`, `content_statuses`
- **New (run migration):** `content_boards`, `content_groups`, `content_board_items`, `content_board_updates`

## Content Deck v2 (Monday-style module)
- Route: `/content-deck`
- Sidebar nav "Content Deck" points to `/content-deck`
- Views: Table (grouped), Kanban, Gantt, Calendar, Files
- Features: status/platform/buyer-stage colored cells, updates side panel, import xlsx/csv, export xlsx/csv
- **Mock data fallback**: if migration not run, shows demo data automatically
- Migration: `scripts/content-deck-board-migration.sql`
- Types: `lib/content-deck/types.ts`, `lib/content-deck/status-colors.ts`
- Hooks: `lib/hooks/useContentBoard.ts`, `lib/hooks/useContentUpdates.ts`
- Import parser: `lib/content-deck/importers/monday-excel-parser.ts`
- Exporter: `lib/content-deck/exporters/content-board-exporter.ts`
- Components: `components/content-deck/`

## SQL Migrations
- `scripts/content-deck-migration.sql` — v1 content_items/comments/attachments/activity
- `scripts/content-deck-board-migration.sql` — v2 boards/groups/board_items/updates

## Known Constraints
- Tooltip must use Radix portal-based (never absolute inside scroll containers)
- TypeScript strict: no `any`, no `@ts-ignore`
- The old `/content` module (pipeline/table/calendar) is still intact, just not linked from sidebar
