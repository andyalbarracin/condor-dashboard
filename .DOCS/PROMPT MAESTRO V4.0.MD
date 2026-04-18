# 🦅 CONDOR ANALYTICS - PROMPT MAESTRO V4.0 PARA AI ASSISTANTS

**Versión:** 4.0  
**Última actualización:** 2026-03-21  
**Proyecto:** CONDOR Analytics Dashboard  
**Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase  
**Deployment:** Vercel (Production) + Local Development  
**Git Repo:** https://github.com/andyalbarracin/condor-dashboard.git

---

## 📋 CHANGELOG V3.0 → V4.0

### Bugs Resueltos (3/3 de GA4 Integration)

1. **BUG #1 RESUELTO — Tooltips invisibles en Web tab**
   - Causa real: `overflow-x-auto` en table wrapper clipea `position: absolute`
   - Fix: Reemplazados CSS tooltips custom por Radix UI `<Tooltip>` (portal-based, escapa overflow)
   - Archivo: `/components/dashboard/web-tab.tsx`

2. **BUG #2 RESUELTO — Navegación bloqueada con solo GA4**
   - Fix: Nuevo state `gaData` separado para GA4, smart redirect ONE-TIME en useEffect de carga
   - Eliminado `else if (!tabParam)` de SearchParamsHandler que forzaba "overview"
   - `hasAnyData` check incluye `gaData`
   - Archivo: `/app/page.tsx`

3. **BUG #3 RESUELTO — Datos desaparecen al subir social/web**
   - Causa real: GA4 subTypes (`utm_campaigns`, `traffic_sources`) caían a `default` case → se guardaban como `content`
   - Fix: Check `parsedData.source === 'google-analytics'` ANTES del switch de subType
   - Incluido `google_analytics` en cálculo de `platforms` metadata
   - Archivo: `/app/upload/page.tsx`

### Types Actualizados
- **`/lib/parsers/types.ts`:**
  - `MultiDataset` ahora incluye `google_analytics?: ParsedDataset`
  - `ParsedDataset.subType` incluye `'utm_campaigns' | 'traffic_sources'`
  - `isMultiDataset()` check incluye `'google_analytics' in data`

### Features Nuevas

4. **Overview Tab Redesign**
   - Greeting header (`WeeklySummaryHeader`) con saludo dinámico por hora
   - KPI cards con sparklines (mini AreaCharts de Recharts)
   - Sección "Web Analytics" snapshot cuando hay GA4 data (sessions + traffic by medium bars)
   - Overview muestra datos si hay social O web (no requiere ambos)
   - Archivo: `/components/dashboard/overview-tab.tsx`

5. **WeeklySummaryHeader Flexible**
   - Props: `variant` ('social' | 'web' | 'overview'), `subtitle`, `webData`
   - Social: muestra modal Weekly Summary (social data)
   - Web: muestra modal Traffic Summary (web data)
   - Overview: Weekly Summary si hay social data
   - Archivo: `/components/dashboard/weekly-summary-header.tsx`

6. **Web Traffic Summary System (NUEVO)**
   - Calculator: `/lib/analytics/web-summary-calculator.ts`
   - Modal: `/components/dashboard/web-summary-modal.tsx`
   - 4 slides con animaciones (framer-motion):
     - `web-summary/intro-slide.tsx` — Intro con botón "Show Me My Traffic"
     - `web-summary/traffic-slide.tsx` — Total sessions + medium breakdown animado
     - `web-summary/campaigns-slide.tsx` — Top 5 campaigns con performance bars
     - `web-summary/conclusion-slide.tsx` — Insights + tips accionables

7. **Web Tab con Header**
   - Web tab ahora tiene `WeeklySummaryHeader` con texto "Let's check how your website is performing"
   - Botón "Traffic Summary" abre el web summary modal
   - Archivo: `/app/page.tsx`

### Git State
- **main:** Actualizado con todos los fixes
- **backup-ga4-web-analytics-v4.0:** Sincronizado
- **client-v2:** Merge completado
- **backup-production-final-v1.4:** Creado (nueva)

---

## 📊 RESUMEN EJECUTIVO

### ¿Qué es CONDOR?

**CONDOR** (Comprehensive Online Dashboard for Optimization and Revenue) es una plataforma de análisis de redes sociales y web que va más allá de métricas de vanidad para proporcionar inteligencia empresarial accionable.

**Objetivo principal:** Ayudar a empresas B2B (especialmente tech y telecomunicaciones) a entender qué contenido genera resultados comerciales reales.

### Propuesta de Valor

- ✅ Analiza patrones de contenido exitoso
- ✅ Benchmarks de industria reales
- ✅ Recomendaciones inteligentes basadas en datos
- ✅ Análisis de ROI (social → web → conversión)
- ✅ Multi-plataforma: LinkedIn, Twitter/X, Google Analytics
- ✅ Weekly & Traffic Summaries con slides animados

### Usuario Objetivo

**Andy** — Marketing Manager en Asentria (B2B tech/telecom). Publica 2 veces/semana en días laborables.

---

## 🎯 ESTADO ACTUAL DEL PROYECTO

### ✅ QUÉ FUNCIONA (Producción)

**Data & Parsing:**
- ✅ LinkedIn Content/Followers/Visitors Analytics (XLS)
- ✅ Twitter/X Content/Account Overview (CSV)
- ✅ Google Analytics 4 UTM Campaigns/Traffic Sources (CSV)
- ✅ Multi-dataset support (5 slots independientes en localStorage)
- ✅ Merge/dedup en uploads múltiples

**Dashboard:**
- ✅ Tabs: Overview, Social, Web
- ✅ Overview: Greeting + social KPIs con sparklines + web analytics snapshot
- ✅ Social: Weekly Summary modal (6 slides), KPIs, heatmap, demographics
- ✅ Web: Traffic Summary modal (4 slides), KPIs, pie chart, campaign table
- ✅ Radix UI tooltips (portal-based) en campaign table
- ✅ Smart initial tab redirect (one-time, no loop)
- ✅ BlankState cuando no hay datos en un tab

**Reports & Export:**
- ✅ Benchmarks de industria
- ✅ Intelligent Recommendations (8 priorizadas)
- ✅ PDF Export profesional
- ✅ Excel Export de tablas

**Pricing page:**
✅ Pricing page (4 plans: Nest / Flight / Altitude / Apex + 30-day trial)

**UI/UX:**
- ✅ Sidebar persistente con tooltips
- ✅ Dark/Light mode automático
- ✅ Responsive design
- ✅ Calendar Heatmap con drill-down
- ✅ Followers Chart con date range filtering

### 🚫 BUGS ACTIVOS: NINGUNO

---

## 📦 ARQUITECTURA TÉCNICA

### Stack

```
Frontend:    Next.js 14.2.35 (App Router), React 18, TypeScript 5
Styling:     Tailwind CSS 3, shadcn/ui, Radix UI
Charts:      Recharts 2.x
Animations:  framer-motion
Icons:       lucide-react
Parsing:     xlsx 0.18.x, papaparse 5.x
PDF:         jsPDF 2.x, jspdf-autotable 3.x
Storage:     localStorage (→ Supabase planned Q2 2026)
Deployment:  Vercel (HTTPS, no SSH)
VCS:         Git + GitHub
```

### Estructura de Directorios

```
condor-dashboard/
├── app/
│   ├── page.tsx                         # Dashboard principal
│   ├── reports/page.tsx                 # Reports & benchmarks
│   ├── upload/page.tsx                  # File upload con merge
│   ├── settings/page.tsx                # Settings (placeholder)
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx, header.tsx, footer.tsx, toolbar.tsx
│   │
│   ├── dashboard/
│   │   ├── overview-tab.tsx             # Overview con sparklines + web snapshot
│   │   ├── social-tab.tsx               # Social details
│   │   ├── web-tab.tsx                  # GA4 campaigns (Radix tooltips)
│   │   ├── blank-state.tsx
│   │   ├── weekly-summary-header.tsx    # Flexible: social/web/overview variants
│   │   ├── weekly-summary-button.tsx
│   │   ├── weekly-summary-modal.tsx     # Social summary (6 slides)
│   │   ├── web-summary-modal.tsx        # ⭐ Web summary (4 slides)
│   │   ├── calendar-heatmap.tsx
│   │   ├── post-drilldown.tsx
│   │   ├── kpi-card.tsx
│   │   ├── top-content-tab.tsx
│   │   ├── followers-chart.tsx
│   │   ├── demographic-card.tsx
│   │   └── platform-breakdown-pie.tsx
│   │
│   ├── dashboard/weekly-summary/        # Social summary slides
│   │   ├── intro-slide.tsx
│   │   ├── overview-slide.tsx
│   │   ├── top-content-slide.tsx
│   │   ├── growth-slide.tsx
│   │   ├── platform-slide.tsx
│   │   ├── report-slide.tsx
│   │   └── conclusion-slide.tsx
│   │
│   ├── dashboard/web-summary/           # ⭐ Web summary slides
│   │   ├── intro-slide.tsx
│   │   ├── traffic-slide.tsx
│   │   ├── campaigns-slide.tsx
│   │   └── conclusion-slide.tsx
│   │
│   ├── reports/
│   ├── upload/
│   └── ui/
│
├── lib/
│   ├── parsers/
│   │   ├── types.ts                     # MultiDataset con google_analytics
│   │   ├── linkedin-parser.ts
│   │   ├── twitter-parser.ts
│   │   ├── google-analytics-parser.ts
│   │   ├── universal-parser.ts
│   │   └── csv-parser.ts
│   │
│   ├── analytics/
│   │   ├── weekly-summary-calculator.ts  # Social summary logic
│   │   └── web-summary-calculator.ts     # ⭐ Web summary logic
│   │
│   ├── reports/
│   │   ├── benchmark-calculator.ts
│   │   ├── content-analyzer.ts
│   │   └── pdf-generator.ts
│   │
│   ├── hooks/useSidebarState.ts
│   └── constants/metric-tooltips.ts
│
└── data/benchmarks.json
```

### Modelo de Datos

```typescript
// MultiDataset — 5 slots independientes en localStorage
interface MultiDataset {
  content?: ParsedDataset           // LinkedIn/Twitter posts
  followers?: ParsedDataset         // LinkedIn followers
  visitors?: ParsedDataset          // LinkedIn visitors
  account_overview?: ParsedDataset  // Twitter account overview
  google_analytics?: ParsedDataset  // GA4 UTM campaigns/traffic
  lastUpdated?: string
  platforms?: string[]
}

// Upload routing:
// 1. parsedData.source === 'google-analytics' → google_analytics slot
// 2. parsedData.subType switch → content/followers/visitors/account_overview
// 3. default → content
```

---

## 🌳 GIT BRANCHES

```
main                              ← Asentria production (Vercel auto-deploy)
├── backup-production-final-v1.2.0
├── backup-production-final-v1.3.0
├── backup-production-final-v1.3.2
├── backup-production-final-v1.4   ← ⭐ NUEVO (post GA4 fix + overview redesign)
├── backup-ga4-web-analytics-v3.1
├── backup-ga4-web-analytics-v4.0  ← Synced with main
├── client-v1
└── client-v2                      ← Synced with main
```

**Workflow:** Feature branches → main. Backup branches at milestones. HTTPS only (SSH port 22 blocked).

---

## 🐛 PROBLEMAS HISTÓRICOS RESUELTOS

1. ✅ Hydration error (WONTFIX — SSR/localStorage mismatch, cosmetic only)
2. ✅ Engagement rate decimal vs percentage normalization
3. ✅ Avg Engagements shown as percentage in PDF
4. ✅ LinkedIn parser dynamic header detection
5. ✅ Timezone bug in day-of-week analysis
6. ✅ Zero-improvement patterns in recommendations
7. ✅ IQR outlier detection simplified
8. ✅ Twitter account overview detection
9. ✅ Followers growth rate card removed (no baseline)
10. ✅ LinkedIn "All posts" vs "Metrics" sheet
11. ✅ GA4 Campaign ID parsing
12. ✅ **Tooltips invisibles** — Radix UI portal (overflow-x-auto bypass)
13. ✅ **Navegación bloqueada** — Smart one-time redirect + gaData state
14. ✅ **Datos desaparecen** — Source-first routing to google_analytics slot

---

## ⚠️ REGLAS CRÍTICAS PARA AI ASSISTANTS

1. **SIEMPRE pedir archivos antes de codear** — usar `view` tool
2. **Archivos COMPLETOS, no snippets** — copy-paste ready
3. **Headers obligatorios** en todos los archivos (path, date, description)
4. **Backup antes de cambios grandes** — cp commands incluidos
5. **NO refactoring no solicitado** — solo lo pedido
6. **TypeScript strict** — no `any`, no `@ts-ignore`
7. **Explicar antes de implementar** — QUÉ, POR QUÉ, RIESGOS
8. **Testing instructions** — paso a paso con cada entrega
9. **Mencionar bugs encontrados** — al inicio de respuesta
10. **Respetar arquitectura existente** — no cambiar stack sin discutir

**Prioridades:** Funcionalidad > Warnings > Features nuevas > Refactoring

**Código en chat:** Markdown code blocks (no artifacts/archivos descargables)

**Comunicación:** Directo, conciso, mix español/inglés. Opciones claras cuando hay alternativas.

---

## 🗺️ ROADMAP — VER DOCUMENTO SEPARADO

Archivo: `CONDOR-ROADMAP-V2.0.md`

---

## ✅ CHECKLIST PARA NUEVO CHAT

- [ ] Leer este documento completo
- [ ] Confirmar qué se va a implementar
- [ ] Pedir archivos relevantes (usar `view`)
- [ ] Backup antes de cambios
- [ ] Entregar archivos completos con headers
- [ ] Instrucciones de testing
- [ ] `npm run build` sin errores
- [ ] Documentar cambios

---

**Production URL:** https://condor-analytics.vercel.app  
**GitHub:** https://github.com/andyalbarracin/condor-dashboard  
**Mantenido por:** Claude (AI Assistant) para Andy