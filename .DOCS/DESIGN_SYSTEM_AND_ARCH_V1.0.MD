# 🦅 CONDOR — DESIGN SYSTEM & ARCHITECTURE GUIDE V1.0

**Versión:** 1.0  
**Fecha:** 2026-04-16  
**Propósito:** Guía de referencia para mantener consistencia visual y arquitectónica en CONDOR.  
Usar como contexto en cada sesión de desarrollo.

---

## 🎨 DESIGN SYSTEM

### Filosofía Visual

**Principios:**
1. **Clarity over decoration** — Cada elemento visual sirve a la comprensión del dato
2. **B2B professional** — No es consumer app. Es una herramienta de trabajo
3. **Density inteligente** — Mostrar mucho sin abrumar (inspirado en Linear, Vercel)
4. **Dark/Light parity** — Ambos modos son ciudadanos de primera clase

**Anti-patterns a evitar:**
- ❌ Gradientes de colores vivos (purple, pink gradient)
- ❌ Ilustraciones cartoon o isométricas genéricas
- ❌ Sombras exageradas o efectos glassmorphism innecesarios
- ❌ Tooltips con z-index bajo (siempre Radix UI portal-based)
- ❌ Tablas sin overflow handling correcto

---

### Tokens de Color

#### Modo Light (default)
```css
/* Background & Surfaces */
--background: #ffffff
--card: #f9fafb         /* Cards, panels */
--card-hover: #f3f4f6   /* Hover state en cards */
--border: #e5e7eb       /* Borders */

/* Texto */
--foreground: #111827        /* Texto principal */
--foreground-muted: #6b7280  /* Texto secundario */
--neutral-400: #9ca3af       /* Texto terciario, labels */

/* Brand */
--primary: #2a5f4a          /* Verde CONDOR (primary actions) */
--primary-foreground: #ffffff
--accent: #16a34a           /* Verde acento (gradientes, highlights) */

/* Status */
--success: #22c55e
--warning: #eab308
--error: #ef4444
--info: #3b82f6
```

#### Modo Dark
```css
--background: #0a0a0a
--card: #111111
--card-hover: #1a1a1a
--border: #262626
--foreground: #fafafa
```

#### Platform Colors
```javascript
const PLATFORM_COLORS = {
  linkedin:           '#0a66c2',  // LinkedIn azul oficial
  twitter:            '#1da1f2',  // Twitter/X azul
  instagram:          '#e1306c',  // Instagram rosa
  tiktok:             '#010101',  // TikTok negro
  'google-analytics': '#e37400',  // GA4 naranja
  facebook:           '#1877f2',  // Facebook azul
}
```

#### Medium Colors (GA4)
```javascript
const MEDIUM_COLORS = {
  'organic':          '#22c55e',
  'direct':           '#3b82f6',
  '(none)':           '#3b82f6',
  'referral':         '#a855f7',
  'post':             '#0ea5e9',
  'email':            '#f97316',
  '(not set)':        '#94a3b8',
  '(unattributable)': '#94a3b8',
}
```
#### Plan Badge Colors
```javascript
const PLAN_BADGE_STYLES = {
  starter:      { dot: 'neutral-400',  bg: 'neutral-100',    text: 'neutral-600'  },  // Nest
  professional: { dot: 'blue-500',     bg: 'blue-50',        text: 'blue-600'     },  // Flight ⭐
  agency:       { dot: 'purple-500',   bg: 'purple-50',      text: 'purple-600'   },  // Altitude
  enterprise:   { dot: 'amber-500',    bg: 'amber-50',       text: 'amber-600'    },  // Apex
}
// Keys are plan IDs (unchanged), names displayed from DB: Nest/Flight/Altitude/Apex
```
---

### Tipografía

```css
/* Variable fonts definidas en app/layout.tsx */
--font-outfit: 'Outfit'     /* Display, headings */
--font-dm-sans: 'DM Sans'   /* Body text */
```

**Escala tipográfica:**
```
text-xs    → 12px  — Labels, captions, tooltips
text-sm    → 14px  — Body, table content, form labels
text-base  → 16px  — Body default
text-lg    → 18px  — Subtítulos, section headers
text-xl    → 20px  — Títulos de cards
text-2xl   → 24px  — Page section titles
text-3xl   → 30px  — Page titles
text-4xl   → 36px  — Hero titles
```

---

### Spacing System (Tailwind)

```
p-1  = 4px    → Tight internal padding (badges, chips)
p-2  = 8px    → Small padding (table cells, compact elements)
p-3  = 12px   → Default button padding
p-4  = 16px   → Card internal padding, table cells
p-5  = 20px   → Card content top padding
p-6  = 24px   → Section padding
p-8  = 32px   → Page horizontal padding
p-10 = 40px   → Large section padding
p-16 = 64px   → Hero section padding
```

---

### Componentes Base

#### KPI Card
```tsx
<KPICard
  label="Total Impressions"
  value="12.4K"
  subText="Views of your content"
  icon={<Eye className="w-6 h-6 text-primary" />}
  tooltipKey="total_impressions"  // Opcional
/>
```

#### Tooltip (SIEMPRE Radix UI)
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Wrappear la tabla o sección en TooltipProvider
<TooltipProvider delayDuration={100}>
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="cursor-help">ⓘ</span>
    </TooltipTrigger>
    <TooltipContent side="top">
      <p>Descripción del tooltip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```
**⚠️ NUNCA usar CSS position:absolute para tooltips dentro de overflow-x-auto**

#### Card con shadcn/ui
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción secundaria</CardDescription>
  </CardHeader>
  <CardContent>
    {/* contenido */}
  </CardContent>
</Card>
```

---

### Patrones de Layout

#### Sidebar + Main
```tsx
<div className="flex h-screen bg-background overflow-hidden">
  <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
  <main
    className="flex-1 flex flex-col transition-all duration-300"
    style={{
      marginLeft: sidebarOpen ? "16rem" : "5rem",
      width: sidebarOpen ? "calc(100vw - 16rem)" : "calc(100vw - 5rem)",
    }}
  >
    <Header />
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="px-8 py-8 min-h-full">
        {/* PAGE CONTENT */}
      </div>
    </div>
    <Footer />
  </main>
</div>
```

#### Grid de KPI Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 4 KPI cards */}
</div>
```

#### Grid de Charts
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* 2 charts side by side en desktop */}
</div>
```

#### Tabla scrollable con tooltips seguros
```tsx
{/* TooltipProvider FUERA del overflow */}
<TooltipProvider>
  <div className="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>
            <div className="flex items-center gap-1">
              Column Name
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">ⓘ</span>
                </TooltipTrigger>
                <TooltipContent side="top">Tooltip text</TooltipContent>
              </Tooltip>
            </div>
          </th>
        </tr>
      </thead>
    </table>
  </div>
</TooltipProvider>
```

---

## 🏗️ ARQUITECTURA

### Estructura de Directorios

```
condor-dashboard/              ← Raíz del proyecto (sin /src)
│
├── app/                       ← Next.js App Router
│   ├── page.tsx               ← Dashboard principal (/)
│   ├── pricing/               ← 🆕 Pricing page (/pricing)
│   │   └── page.tsx
│   ├── auth/                  ← 🆕 Auth flow (/auth/*)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts  ← OAuth callback de Supabase
│   ├── reports/page.tsx       ← Reports (/reports)
│   ├── upload/page.tsx        ← Upload (/upload)
│   ├── settings/page.tsx      ← Settings (/settings)
│   ├── layout.tsx             ← Root layout
│   └── globals.css
│
├── components/
│   ├── layout/                ← Sidebar, Header, Toolbar, Footer
│   ├── dashboard/             ← Tabs y componentes del dashboard
│   │   ├── overview-tab.tsx
│   │   ├── social-tab.tsx
│   │   ├── web-tab.tsx
│   │   ├── blank-state.tsx
│   │   ├── weekly-summary-header.tsx
│   │   ├── web-summary-modal.tsx
│   │   ├── weekly-summary-modal.tsx
│   │   └── weekly-summary/    ← Slides del social summary
│   │       └── web-summary/   ← Slides del web summary
│   ├── auth/                  ← 🆕 Auth components
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── billing/               ← 🆕 Billing/plan components
│   │   ├── plan-badge.tsx     ← Badge que muestra el plan actual
│   │   ├── trial-banner.tsx   ← Banner de días restantes en trial
│   │   └── upgrade-modal.tsx  ← Modal de upgrade cuando se alcanza límite
│   ├── reports/
│   ├── upload/
│   └── ui/                    ← shadcn/ui components
│
├── lib/
│   ├── parsers/               ← Parsers de archivos
│   │   ├── types.ts
│   │   ├── universal-parser.ts
│   │   ├── linkedin-parser.ts
│   │   ├── twitter-parser.ts
│   │   ├── google-analytics-parser.ts
│   │   └── csv-parser.ts
│   ├── analytics/             ← Calculadoras de analytics
│   │   ├── weekly-summary-calculator.ts
│   │   └── web-summary-calculator.ts
│   ├── reports/               ← Generadores de reportes
│   │   ├── benchmark-calculator.ts
│   │   ├── content-analyzer.ts
│   │   └── pdf-generator.ts
│   ├── supabase/              ← 🆕 Cliente Supabase
│   │   ├── client.ts          ← Browser client
│   │   ├── server.ts          ← Server client (SSR)
│   │   └── middleware.ts      ← Auth middleware
│   ├── hooks/
│   │   ├── useSidebarState.ts
│   │   ├── useAuth.ts         ← 🆕 Hook de auth
│   │   └── useSubscription.ts ← 🆕 Hook de plan/subscription
│   └── constants/
│       └── metric-tooltips.ts
│
├── data/
│   └── benchmarks.json
│
├── middleware.ts              ← 🆕 Next.js middleware para auth
│
├── CONDOR-MARKET-STUDY-V1.0.md        ← 🆕 Estudio de mercado
├── CONDOR-SCHEMA-MIGRATION-V2.0.sql   ← 🆕 SQL de Supabase
├── CONDOR-DESIGN-SYSTEM-V1.0.md       ← 🆕 Este archivo
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Por Qué No Tenemos `/src`

Next.js soporta dos estructuras:
- Con `/src`: `src/app/`, `src/components/`, etc.
- Sin `/src`: `app/`, `components/`, etc. (directamente en raíz)

CONDOR fue iniciado en Lovable que usa la estructura sin `/src`. **No hay razón para migrar** — es solo convención y ambas son 100% válidas. La migración implicaría renombrar todos los paths y es riesgo sin beneficio.

---

### Flujo de Datos (Estado Actual — v1.4)

```
Upload (CSV/XLS)
     ↓
universal-parser.ts → Detecta plataforma
     ↓
Parser específico → Normaliza a NormalizedDataPoint[]
     ↓
handleSaveData() en /app/upload/page.tsx
     ↓ (merge con datos existentes)
localStorage "condor_analytics_data" (MultiDataset JSON)
     ↓
/app/page.tsx useEffect → Lee localStorage
     ↓
Sets de estado: allData, gaData, followersData, visitorsData
     ↓
Tabs: OverviewTab, SocialTab, WebTab
```

### Flujo de Datos (Futuro con Supabase)

```
Upload (CSV/XLS)
     ↓
Parser → NormalizedDataPoint[]
     ↓
/api/datasets POST → Supabase analytics_datasets
     ↓ (RLS protege acceso por user_id + workspace_id)
Supabase DB
     ↓
/app/page.tsx useEffect → fetch via Supabase client
     ↓
Sets de estado → Tabs
```

---

### Estado Global — Sin Context API (por ahora)

El estado del dashboard vive en `/app/page.tsx` y se pasa como props a los tabs. Es suficiente para el MVP. Cuando se agregue multi-workspace, se moverá a un Context o Zustand.

**Variables de estado en /app/page.tsx:**
```typescript
const [hasData, setHasData] = useState(false)
const [allData, setAllData] = useState<ParsedDataset[]>([])
const [gaData, setGaData] = useState<ParsedDataset | null>(null)
const [followersData, setFollowersData] = useState<ParsedDataset | null>(null)
const [visitorsData, setVisitorsData] = useState<ParsedDataset | null>(null)
const [activeTab, setActiveTab] = useState<"overview" | "social" | "web">("overview")
const [platform, setPlatform] = useState("All")
const [dateRange, setDateRange] = useState("1 month")
const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
const [sidebarOpen, setSidebarOpen] = useSidebarState()
```

---

### MultiDataset Structure (localStorage key: "condor_analytics_data")

```typescript
interface MultiDataset {
  content?: ParsedDataset           // LinkedIn/Twitter posts
  followers?: ParsedDataset         // LinkedIn followers
  visitors?: ParsedDataset          // LinkedIn visitors
  account_overview?: ParsedDataset  // Twitter account overview
  google_analytics?: ParsedDataset  // GA4 UTM campaigns / traffic sources
  lastUpdated?: string
  platforms?: string[]
}
```

**Routing de uploads en /app/upload/page.tsx:**
1. Si `parsedData.source === 'google-analytics'` → slot `google_analytics`
2. Si no, hacer switch de `parsedData.subType`:
   - 'content' → merge a `content`
   - 'followers' → merge a `followers`
   - 'visitors' → merge a `visitors`
   - 'account_overview' → `account_overview`
   - default → `content` (fallback)

---

### Reglas de TypeScript

```typescript
// ✅ SIEMPRE: tipos explícitos
const data: ParsedDataset = getData()

// ✅ SIEMPRE: optional chaining
const value = obj?.nested?.property ?? defaultValue

// ✅ SIEMPRE: type guards
if (isMultiDataset(data)) {
  // TypeScript sabe que es MultiDataset aquí
}

// ❌ NUNCA: any
const data: any = getData()  

// ❌ NUNCA: ts-ignore
// @ts-ignore
const result = something()
```

---

### Git Workflow

```bash
# Crear backup antes de cambios importantes
git checkout main
git checkout -b backup-descripcion-$(date +%Y%m%d)
git push origin backup-descripcion-$(date +%Y%m%d)

# Feature nueva
git checkout main && git pull origin main
git checkout -b feature/nombre-feature
# ... trabajo ...
git add . && git commit -m "feat: descripción"
git push origin feature/nombre-feature

# Merge a main
git checkout main && git merge feature/nombre-feature
git push origin main

# HTTPS siempre (SSH bloqueado en la red de Andy)
git remote set-url origin https://github.com/andyalbarracin/condor-dashboard.git
```

**Branches actuales:**
- `main` — Producción (Vercel auto-deploy)
- `backup-production-final-v1.4` — Último backup estable
- `backup-ga4-web-analytics-v4.0` — Pre-auth backup

---

## 🚀 PRÓXIMAS IMPLEMENTACIONES (Prioridad)

### P0 — Auth System (Semana 1)

**Archivos a crear:**
- `/app/auth/login/page.tsx`
- `/app/auth/signup/page.tsx`
- `/app/auth/callback/route.ts`
- `/lib/supabase/client.ts`
- `/lib/supabase/server.ts`
- `/middleware.ts`

**Flujo:**
1. Usuario visita `/auth/signup`
2. Ingresa email + password (o click "Continue with Google")
3. Supabase crea auth.users → trigger crea profiles + subscriptions (trial)
4. Redirect a `/` (dashboard)
5. Trial de 30 días activo automáticamente

### P1 — Migración de datos localStorage → Supabase (Semana 2)

**Estrategia dual-write:**
1. Mantener localStorage como fallback (compatibilidad)
2. Si usuario autenticado, guardar en Supabase analytics_datasets
3. Leer de Supabase si autenticado, localStorage si no
4. Eventual deprecación de localStorage

### P2 — Trial Banner + Plan Badge (Semana 2)

**Components a crear:**
- `/components/billing/trial-banner.tsx` — "X días restantes en tu trial"
- `/components/billing/plan-badge.tsx` — Badge en sidebar con el plan
- `/components/billing/upgrade-modal.tsx` — Modal cuando se alcanza límite

### P3 — Pricing Page (Ya lista — ver /app/pricing/page.tsx)

Solo falta agregar al `sidebar.tsx` el link de navegación y al layout.

---

## 📋 CHECKLIST DE NUEVA SESIÓN

Cuando comiences una nueva sesión de desarrollo en CONDOR:

- [ ] Leer Prompt Maestro V4.0
- [ ] Leer este Design System
- [ ] Confirmar qué se va a implementar
- [ ] Pedir archivos relevantes (`view` tool)
- [ ] Backup antes de cambios
- [ ] Entregar archivos completos con headers
- [ ] Instrucciones de testing
- [ ] `npm run build` sin errores

---

*Última actualización: 2026-04-16*