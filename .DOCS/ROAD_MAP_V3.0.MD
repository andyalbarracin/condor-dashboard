# 🦅 CONDOR — ROADMAP ESTRATÉGICO Y TÉCNICO V2.0

**Versión:** 2.0  
**Fecha:** 2026-03-21  
**Visión:** "Condor no muestra métricas. Condor te dice qué hacer."  
**Posicionamiento:** Analytics for non-analytics people

---

## 📊 ESTADO ACTUAL — LÍNEA BASE

### Lo que ya existe (v1.4)

| Categoría | Feature | Status |
|-----------|---------|--------|
| Parsing | LinkedIn Content/Followers/Visitors (XLS) | ✅ |
| Parsing | Twitter/X Content/Account Overview (CSV) | ✅ |
| Parsing | Google Analytics 4 UTM/Traffic (CSV) | ✅ |
| Storage | Multi-dataset localStorage (5 slots) | ✅ |
| Dashboard | Overview con sparklines + web snapshot | ✅ |
| Dashboard | Social tab con Weekly Summary modal | ✅ |
| Dashboard | Web tab con Traffic Summary modal | ✅ |
| Reports | Benchmarks de industria + Recommendations | ✅ |
| Export | PDF profesional + Excel | ✅ |
| UI | Dark/Light mode, responsive, sidebar | ✅ |

### Stack actual
- Next.js 14, TypeScript, Tailwind, Recharts, shadcn/ui, Radix UI
- framer-motion, xlsx, papaparse, jsPDF
- localStorage (temporal)
- Vercel (deploy)

---

## 🚀 FASE 1 — PLATAFORMAS ADICIONALES

**Timeline:** Q1–Q2 2026  
**Esfuerzo:** 2–3 semanas  
**Costo:** $0

### 1.1 Instagram Integration

**Complejidad:** Media (3–5 días)

**Qué:**
- Parser para Instagram Insights export (CSV/JSON)
- Métricas: reach, impressions, saves, profile visits, story views/exits/completion, reels plays/avg watch time
- Normalización a `NormalizedDataPoint` con `source: 'instagram'`
- Filtros de plataforma actualizados en toolbar
- KPI cards nuevas en Social tab

**Cómo:**
- Investigar formato exacto de export de Instagram Professional Dashboard
- Crear `/lib/parsers/instagram-parser.ts`
- Agregar detección en `universal-parser.ts` (buscar headers como "Reach", "Saves", "Profile visits")
- Agregar `'instagram'` a filtros de plataforma en toolbar
- Actualizar `PlatformBreakdownPie` para incluir Instagram
- Benchmarks de Instagram en `benchmarks.json`

**Archivos nuevos:**
- `/lib/parsers/instagram-parser.ts`

**Archivos modificados:**
- `/lib/parsers/universal-parser.ts` (detección)
- `/components/layout/toolbar.tsx` (filtro de plataforma)
- `/components/dashboard/platform-breakdown-pie.tsx` (color/label)
- `/data/benchmarks.json` (benchmarks Instagram B2B)

**Riesgos:**
- Instagram cambia formatos de export frecuentemente
- Meta puede discontinuar exports manuales en favor de API
- Story metrics pueden tener formato diferente a post metrics

---

### 1.2 TikTok Integration

**Complejidad:** Media-Alta (5–7 días)

**Qué:**
- Parser para TikTok Analytics export (CSV)
- Métricas: video views, avg watch time, shares, profile views, likes, comments, trending score
- Métricas específicas: sound uses, duets, stitches (si disponibles)
- Normalización con `source: 'tiktok'`

**Cómo:**
- Investigar formato de export de TikTok Business Suite / Creator Tools
- Crear `/lib/parsers/tiktok-parser.ts`
- TikTok exporta métricas de video (no "posts") — adaptar UI labels
- Agregar "Watch Time" como KPI diferencial vs otras plataformas
- Agregar benchmarks TikTok B2B (poco comunes, investigar Hootsuite/Sprout)

**Archivos nuevos:**
- `/lib/parsers/tiktok-parser.ts`

**Archivos modificados:**
- Mismos que Instagram (universal-parser, toolbar, pie chart, benchmarks)

**Riesgos:**
- TikTok B2B es nicho — benchmarks menos establecidos
- Formato de export puede variar por región
- Watch time metrics requieren KPI cards con formato diferente (mm:ss vs números)

---

### 1.3 Meta/Facebook Integration (Opcional)

**Complejidad:** Media (4–6 días)

**Qué:**
- Parser para Facebook Page Insights export
- Métricas: reach, engagements, page views, followers growth
- Diferenciación entre Page posts y Reels

**Decisión:** Evaluar si el target user (B2B tech) usa Facebook activamente. Probablemente baja prioridad vs Instagram/TikTok.

---

## 🚀 FASE 2 — INTERPRETACIÓN INTELIGENTE (AI)

**Timeline:** Q2 2026  
**Esfuerzo:** 3–4 semanas  
**Costo:** $5–30 USD/mes (API calls)

### 2.1 AI Content Analysis

**Complejidad:** Alta (7–10 días)

**Qué:**
- Análisis de posts top-performing usando LLM
- Detección de patrones: tone, length, keywords, CTA, format
- Generación de variaciones de copy optimizadas
- Trending topics en industria del usuario

**Tecnología:**
- **Opción A: Claude API (Anthropic)** — Mejor razonamiento, más caro (~$3/1M input tokens)
- **Opción B: OpenAI GPT-4o-mini** — Más barato (~$0.15/1M input tokens), suficiente para análisis
- **Recomendación:** GPT-4o-mini para análisis masivo, Claude para insights profundos

**Implementación:**
```
1. Usuario selecciona post top-performing
2. Sistema envía: post content + metrics + benchmarks + historical context
3. AI responde: análisis de éxito + 3-5 variaciones sugeridas
4. Usuario edita/publica
5. Tracking de performance de variaciones (feedback loop)
```

**Archivos nuevos:**
- `/lib/ai/content-analyzer.ts` — Prompts + API calls
- `/lib/ai/suggestion-generator.ts` — Variaciones de copy
- `/components/dashboard/ai-suggestions-panel.tsx` — UI panel
- `/components/dashboard/ai-content-card.tsx` — Card individual

**Archivos modificados:**
- `/app/page.tsx` (nuevo panel/sección en Social tab)
- `package.json` (agregar `openai` o `@anthropic-ai/sdk`)

**Costos estimados:**
- 50 análisis/mes × ~500 tokens/análisis = ~25K tokens/mes
- GPT-4o-mini: ~$0.004/mes (negligible)
- Claude Sonnet: ~$0.075/mes (negligible)
- **En escala (1000 users × 50 análisis):** $4–75/mes

**Riesgos:**
- Latencia de API (2–5 segundos por análisis)
- Calidad inconsistente en sugerencias
- Rate limits de API
- Necesidad de prompt engineering iterativo

---

### 2.2 Smart Recommendations Engine v2

**Complejidad:** Media (5–7 días)

**Qué:**
- Upgrade del sistema actual de recommendations (rule-based → AI-enhanced)
- Recomendaciones contextuales: "Publicá a las 18hs los martes"
- Predicción simple de performance basada en histórico
- Detección automática de content clusters que funcionan

**Implementación:**
- Mantener sistema rule-based actual como fallback
- Agregar capa AI para recommendations más sofisticadas
- Comparación A/B: rule-based vs AI (log cuáles generan más engagement)

**Archivos modificados:**
- `/lib/reports/content-analyzer.ts` (agregar AI layer)
- `/lib/reports/benchmark-calculator.ts` (AI-enhanced comparisons)

---

### 2.3 Natural Language Insights

**Complejidad:** Media (4–6 días)

**Qué:**
- Convertir datos en narrativas legibles
- "Tu engagement bajó 15% esta semana, principalmente por la caída en LinkedIn. Los posts con video siguen rindiendo 2x vs promedio."
- Integrar en Weekly Summary slides

**Implementación:**
- AI genera narrativa basada en datos calculados
- Cache de narrativas (no regenerar en cada view)
- Fallback a insights rule-based si API falla

---

## 🚀 FASE 3 — AUTOMATIZACIÓN DE DATOS

**Timeline:** Q2–Q3 2026  
**Esfuerzo:** 4–6 semanas  
**Costo:** $0–50 USD/mes

### 3.1 Google Analytics OAuth Integration

**Complejidad:** Alta (7–10 días)  
**Prioridad:** Alta

**Qué:**
- Conexión directa con GA4 API (eliminar CSV manual)
- Data en real-time (no snapshots estáticos)
- Revenue tracking por fuente social
- Funnel analysis: social → website → conversion
- Goal completions tracking

**Tecnología:**
- Google Analytics Data API v1 (`@google-analytics/data`)
- OAuth 2.0 con Google Cloud Console
- Refresh tokens almacenados en Supabase (requiere Fase 4)

**Implementación:**
```
1. Setup Google Cloud project + OAuth consent screen
2. Implementar OAuth flow (login con Google)
3. Almacenar refresh token (Supabase)
4. API calls periódicas para sync de datos
5. Caching de datos en localStorage + Supabase
```

**Archivos nuevos:**
- `/lib/integrations/google-analytics-api.ts`
- `/app/api/auth/google/route.ts` (OAuth callback)
- `/app/api/ga4/sync/route.ts` (data sync endpoint)
- `/components/settings/google-connection.tsx`

**Costos:**
- Google Analytics API: Gratis (quota: 10,000 requests/day)
- Google Cloud: $0 (free tier suficiente)

**Riesgos:**
- OAuth setup complejo (consent screen, scopes, verification)
- Requiere Supabase para almacenar tokens (dependencia con Fase 4)
- API rate limits (10K requests/day)
- Requiere HTTPS (ya lo tenemos con Vercel)

---

### 3.2 LinkedIn API Integration

**Complejidad:** Muy Alta (10–14 días)  
**Prioridad:** Media

**Qué:**
- Conexión con LinkedIn Marketing API
- Sync automático de content/followers/visitors
- Eliminar upload manual de XLS

**Tecnología:**
- LinkedIn Marketing API v2
- OAuth 2.0 (LinkedIn Developer Portal)
- Requiere LinkedIn Marketing Developer Platform access

**Costos:**
- LinkedIn API: Gratis para Marketing API (requiere aplicación y aprobación)
- Setup time: Alto (aprobación puede tomar 2–4 semanas)

**Riesgos:**
- LinkedIn es muy restrictivo con API access
- Marketing API requiere empresa verificada
- Rate limits estrictos (100 requests/day para algunos endpoints)
- API puede cambiar sin aviso previo

**Alternativa:** Mantener CSV upload como opción principal, API como premium feature

---

### 3.3 Twitter/X API Integration

**Complejidad:** Media-Alta (5–7 días)  
**Prioridad:** Baja (X API se volvió muy caro)

**Costos:**
- X API Basic: $100/mes (muy limitado)
- X API Pro: $5,000/mes (enterprise)
- **Recomendación:** Mantener CSV upload, no integrar API por costo

---

### 3.4 Automatización con n8n (Self-hosted)

**Complejidad:** Media (5–7 días)  
**Prioridad:** Opcional

**Qué:**
- Workflows automáticos para sync de datos
- Scheduled jobs (cron) para actualización periódica
- Webhooks para notificaciones
- Integración con email/Slack para alerts

**Tecnología:**
- n8n (self-hosted en DigitalOcean $5/mes o Render free tier)
- Workflows: GA4 sync → Process → Store en Supabase
- Triggers: Scheduled (daily) o manual

**Costos:**
- n8n self-hosted: $5–12/mes (servidor)
- n8n cloud: $20–50/mes
- **Recomendación:** Self-hosted para mantener costos bajos

---

## 🚀 FASE 4 — BACKEND + PERSISTENCIA

**Timeline:** Q3 2026  
**Esfuerzo:** 4–6 semanas  
**Costo:** $0–25 USD/mes

### 4.1 Migración localStorage → Supabase

**Complejidad:** Alta (7–10 días)  
**Prioridad:** Crítica (prerequisito para multi-user)

**Qué:**
- Migrar de localStorage a Supabase PostgreSQL
- Modelo de datos relacional para datasets
- Row Level Security (RLS) para multi-tenant
- Migration script para usuarios existentes

**Tecnología:**
- Supabase PostgreSQL (free tier: 500MB, 2 projects)
- Supabase JS Client (`@supabase/supabase-js`)
- Row Level Security policies

**Database Schema:**
```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Org membership
CREATE TABLE memberships (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'editor', 'viewer')) NOT NULL,
  PRIMARY KEY (user_id, org_id)
);

-- Datasets (replaces localStorage)
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('content', 'followers', 'visitors', 'account_overview', 'google_analytics')) NOT NULL,
  source TEXT CHECK (source IN ('linkedin', 'twitter', 'instagram', 'tiktok', 'google-analytics')) NOT NULL,
  data JSONB NOT NULL,
  date_range JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API connections (OAuth tokens)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google', 'linkedin', etc.
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access org datasets"
  ON datasets FOR ALL
  USING (org_id IN (
    SELECT org_id FROM memberships WHERE user_id = auth.uid()
  ));
```

**Migration Strategy:**
1. Supabase setup (schema + RLS)
2. Dual-write: guardar en localStorage Y Supabase
3. Read from Supabase, fallback to localStorage
4. Remover localStorage después de validación
5. Migration script para usuarios existentes

**Costos:**
- Supabase Free: 500MB storage, 2GB bandwidth, 50K MAU
- Supabase Pro ($25/mes): 8GB storage, 250GB bandwidth, 100K MAU
- **Empezar con Free, escalar a Pro cuando haya >50 users**

---

### 4.2 Authentication System

**Complejidad:** Media (5–7 días)

**Qué:**
- Supabase Auth (Google OAuth + email/password)
- Signup/Login flow
- Session management
- Protected routes

**Implementación:**
- `/app/auth/login/page.tsx`
- `/app/auth/signup/page.tsx`
- `/app/auth/callback/route.ts`
- Middleware para proteger rutas
- Context provider para auth state

**Costos:** $0 (incluido en Supabase free tier)

---

## 🚀 FASE 5 — PRODUCTO MULTI-USER

**Timeline:** Q3–Q4 2026  
**Esfuerzo:** 6–8 semanas  
**Costo:** $25–100 USD/mes

### 5.1 Multi-User / Team Collaboration

**Complejidad:** Muy Alta (10–14 días)

**Qué:**
- Workspaces/Organizations
- Roles: Owner, Admin, Editor, Viewer
- Invite team members (email)
- Shared dashboards
- Activity log / audit trail

**Implementación:**
- Organization creation flow
- Invite system (email + magic link)
- Role-based access control (RBAC)
- Organization switcher en header
- Activity feed en sidebar o settings

---

### 5.2 Reportes Avanzados

**Complejidad:** Media (5–7 días)

**Qué:**
- Reportes programados (weekly/monthly email)
- White-label reports (logo del cliente)
- Historical comparisons (this month vs last month vs same month last year)
- Custom date ranges con presets
- Reportes compartibles por URL

**Tecnología:**
- Supabase Edge Functions para scheduled reports
- SendGrid/Resend para emails ($0 free tier)
- Vercel OG Image para thumbnails compartibles

---

### 5.3 Visitor Location Map

**Complejidad:** Media (5–7 días)

**Qué:**
- Mapa interactivo de ubicación de visitantes
- Heatmap por país/región
- Drill-down a ciudad
- Overlay con métricas por región

**Tecnología:**
- **react-leaflet** (open source, gratis) — Recomendado
- Mapbox GL (mejor UX, requiere API key, free tier 50K loads/mes)
- D3-geo (más control, más complejo)

**Costos:**
- react-leaflet: $0
- Mapbox: $0 hasta 50K map loads/mes

---

## 🚀 FASE 6 — MONETIZACIÓN

**Timeline:** Q4 2026  
**Esfuerzo:** 3–4 semanas  
**Costo:** $50–200 USD/mes (infrastructure)

### 6.1 Pricing Model

| Plan | Precio | Target |
|------|--------|--------|
| **Nest**| $19/mes ($15 anual) | Individual marketer, 1 proyecto, LinkedIn + X |
| **Flight** | $49/mes ($39 anual) | Marketer serio, 3 proyectos, AI 5 consultas/mes |
| **Altitude**| $129/mes ($99 anual) | Agencia chica, proyectos ilimitados, AI completa |
| **Apex**| Desde $199/mes (custom) | Agencia grande, multi-user, white-label |

### 6.2 Payment Integration

**Tecnología:**
- **Stripe** ($0 hasta revenue, 2.9% + $0.30 por transaction)
- Stripe Checkout para signup
- Stripe Customer Portal para manage subscription
- Webhooks para sync con Supabase

**Implementación:**
- `/app/api/stripe/checkout/route.ts`
- `/app/api/stripe/webhook/route.ts`
- `/app/pricing/page.tsx`
- `/app/settings/billing/page.tsx`
- Feature flags basados en plan (free/pro/agency)

**Archivos nuevos:**
- `/lib/billing/stripe.ts`
- `/lib/billing/feature-flags.ts`

---

### 6.3 Usage Tracking & Limits

**Qué:**
- Track API calls por usuario/org
- Enforce limits por plan (AI insights/mes, storage, etc.)
- Usage dashboard en settings
- Upgrade prompts cuando se acercan a limits

---

## 🚀 FASE 7 — DIFERENCIAL COMPETITIVO

**Timeline:** Q1 2027  
**Esfuerzo:** 6–10 semanas  
**Costo:** $100–500 USD/mes

### 7.1 Competitor Benchmarking

**Complejidad:** Muy Alta (10–14 días)

**Qué:**
- Base de datos de competidores por industria
- Comparación directa de métricas públicas
- Gap analysis automático
- Alertas cuando competidor supera tus números
- Trending content de competidores

**Tecnología:**
- Web scraping de perfiles públicos (Puppeteer/Playwright)
- Scheduled jobs para actualización (n8n o Supabase Edge Functions)
- Respeto de ToS de plataformas (solo datos públicos)

**Consideraciones legales:**
- Solo datos públicamente accesibles
- Rate limiting responsable
- Opt-out mechanism
- Disclosure a usuarios
- Cumplir GDPR si hay usuarios EU

**Costos:**
- Servidor para scraping: $10–20/mes
- Proxy service (para evitar bans): $20–50/mes
- Storage extra en Supabase: incluido en Pro plan

---

### 7.2 Revenue Attribution (CRM Integration)

**Complejidad:** Muy Alta (14–21 días)  
**Prioridad:** Crítica para value prop enterprise

**Qué:**
- Integración con HubSpot / Salesforce
- UTM tracking end-to-end: social post → website visit → lead → deal
- Multi-touch attribution models
- Pipeline influence scoring
- ROI calculator por plataforma/campaign
- Customer journey mapping

**Modelos de Attribution:**
- First-touch: 100% crédito al primer contacto social
- Last-touch: 100% crédito al último contacto antes de conversión
- Linear: Crédito igualmente distribuido
- Time-decay: Más peso a touchpoints recientes
- Data-driven: ML model basado en histórico (requiere >1000 conversiones)

**Tecnología:**
- HubSpot API (gratis para CRM free, $50/mes para Marketing Hub)
- Salesforce API (requiere Enterprise edition, costoso)
- Custom attribution engine en TypeScript
- Dashboard de Revenue Intelligence

**Costos:**
- HubSpot API: $0 (CRM free) o $50/mes (Marketing Hub)
- Salesforce: $25–150/user/mes (depende del plan del cliente)
- Desarrollo: Significativo (3–4 semanas)

**Métricas nuevas:**
```
- Post-to-deal conversion rate
- Average deal size from social
- Sales cycle length (social touch → close)
- Customer LTV by acquisition source
- MQLs/SQLs from social
- Pipeline value influenced
- Closed-won value attributed
- ROI = (Revenue - Cost) / Cost
- CAC = Total Marketing Cost / Customers Acquired
```

---

### 7.3 Predictive Analytics

**Complejidad:** Alta (7–10 días)

**Qué:**
- Predicción de performance de próximo post
- Estimación de reach/engagement basada en:
  - Día/hora de publicación
  - Tipo de contenido (image/video/text/carousel)
  - Longitud del copy
  - Keywords detectados
  - Histórico del usuario
- Sugerencia de "best time to post" personalizada

**Tecnología:**
- Regression model simple en TypeScript (no necesita ML complejo)
- O usar LLM para predicción basada en contexto
- Cache de modelos por usuario

**Costos:** $0–5/mes (API calls para LLM approach)

---

## 🚀 FASE 8 — ESCALA Y CRECIMIENTO

**Timeline:** Q2 2027+  
**Esfuerzo:** Ongoing  
**Costo:** $200–1000+ USD/mes

### 8.1 White-Label Solution

**Qué:**
- Agencias pueden usar Condor con su propia marca
- Custom domain support (agency.condor.app → analytics.agency.com)
- Custom logo, colors, fonts
- Client-facing dashboards

**Tecnología:**
- Vercel custom domains API
- Theming system (CSS variables ya parcialmente implementado)
- Tenant-specific branding en Supabase

---

### 8.2 API Pública

**Qué:**
- REST API para acceder a datos de Condor
- API keys management
- Rate limiting por plan
- Webhooks para notificaciones

**Tecnología:**
- Next.js API routes
- API key auth (Supabase)
- OpenAPI/Swagger docs

---

### 8.3 Mobile App

**Qué:**
- App nativa para iOS/Android
- Push notifications para insights
- Quick view de KPIs
- Share reports desde mobile

**Tecnología:**
- React Native (reusar lógica de negocio)
- O PWA (Progressive Web App) — más rápido de implementar
- **Recomendación:** PWA primero, nativa después

**Costos:**
- PWA: $0 extra
- React Native: $99/año (Apple Developer) + $25 one-time (Google Play)

---

## 💰 RESUMEN DE COSTOS POR FASE

| Fase | Timeline | Costo/Mes | Acumulado |
|------|----------|-----------|-----------|
| 1. Plataformas | Q1-Q2 2026 | $0 | $0 |
| 2. AI | Q2 2026 | $5–30 | $5–30 |
| 3. Automatización | Q2-Q3 2026 | $0–50 | $5–80 |
| 4. Backend | Q3 2026 | $0–25 | $5–105 |
| 5. Multi-user | Q3-Q4 2026 | $25–100 | $30–205 |
| 6. Monetización | Q4 2026 | $50–200 | $80–405 |
| 7. Diferencial | Q1 2027 | $100–500 | $180–905 |
| 8. Escala | Q2 2027+ | $200–1000+ | $380–1905+ |

**Break-even estimate:**
- Con 20 usuarios Pro ($15/mes) = $300/mes → cubre Fases 1–5
- Con 50 usuarios Pro + 10 Agency ($40/mes) = $1,150/mes → cubre todo

---

## 🧠 PRINCIPIOS DEL PRODUCTO

1. **No abrumar** — Mostrar solo lo relevante
2. **Explicar todo** — Cada métrica tiene tooltip/contexto
3. **Mostrar lo importante primero** — KPIs → details → raw data
4. **Enfocar en decisiones** — "Qué hacer" no solo "qué pasó"
5. **Respetar el tiempo** — Insights en <5 segundos de load

---

## 🧨 REGLA DE ORO

> Si el usuario necesita interpretar datos manualmente → Condor falló.

---

## 📋 PRIORIDADES INMEDIATAS (Próxima sesión)

1. **Resolver intro-slide.tsx** encoding issue
2. **Push cambios** a main + branches
3. **Decidir:** Instagram parser o Enhanced GA4 (OAuth)?
4. **Actualizar Prompt Maestro** en el repo

---

**Última actualización:** 2026-03-21  
**Versión:** 2.0