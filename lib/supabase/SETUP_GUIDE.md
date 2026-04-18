# 🦅 CONDOR — Supabase Setup Guide v2.1

**Last Updated:** April 16, 2026  
**Schema Version:** 2.1 (10 tables with full RLS)

---

## Step 1: Run SQL migrations in order

Go to **Supabase Dashboard → SQL Editor** and run these scripts one by one:

### Migration 1 — Core schema
File: `CONDOR-SCHEMA-MIGRATION-V2.0.sql`

Creates:
- `subscription_plans` (with 4 plans pre-inserted: Starter, Professional, Agency, HiperView)
- `profiles` (extends auth.users, auto-created via trigger)
- `subscriptions` (trial created automatically on signup)
- `workspaces`
- `analytics_datasets`
- `analytics_metrics`
- `workspace_members`
- Full Row Level Security on all tables

### Migration 2 — Roles, onboarding, connections
File: `003_onboarding_and_roles.sql`

Adds to `profiles`:
- `role` column: `'user'` | `'admin'` | `'super_admin'`
- `onboarding_step`, `industry`, `company_size`, etc.

Creates new tables:
- `onboarding_responses`
- `platform_connections` (OAuth foundation for GA4, LinkedIn, X)
- `audit_logs`

Creates helper function `is_super_admin()`.

---

## Step 2: Set your Super Admin role

After creating your account in the app:

```sql
-- Replace with your actual email
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'your-email@here.com';

-- Verify
SELECT id, email, role FROM public.profiles WHERE role = 'super_admin';
```

---

## Step 3: Enable Google OAuth

1. Go to **Supabase Dashboard → Authentication → Providers**
2. Find **Google** and enable it
3. Go to [Google Cloud Console](https://console.cloud.google.com/)
4. Create a project (or use an existing one)
5. Enable **Google Identity / OAuth 2.0**
6. Create OAuth credentials:
   - Application type: **Web application**
   - Authorized redirect URI: `https://[your-project-id].supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**
8. Paste them in the Supabase Google provider settings
9. In the Supabase dashboard, also add your site URL to **Allowed Redirect URLs**:
   - `https://condor-analytics.vercel.app/**`
   - `http://localhost:3000/**` (for local dev)

---

## Step 4: Environment variables

Verify these exist in `.env.local` (and in Vercel Environment Variables for production):

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (server-side only, never expose to browser)
```

For future Stripe integration (billing):
```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## Step 5: Rename Enterprise plan (optional)

Andy's naming preference:

```sql
UPDATE public.subscription_plans
SET name = 'HiperView'
WHERE id = 'enterprise';
```

---

## Step 6: Configure email confirmation (optional for dev)

For local development, you may want to disable email confirmation so you can test instantly:

1. **Supabase Dashboard → Authentication → Settings**
2. Toggle off **Enable email confirmations** (only for dev!)
3. Re-enable before going to production

---

## Verify the setup

Run this query to confirm all 10 tables exist with RLS enabled:

```sql
SELECT tablename, rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected result: 10 tables, all with `rls_enabled = true`

```
analytics_datasets    | true
analytics_metrics     | true
audit_logs            | true
onboarding_responses  | true
platform_connections  | true
profiles              | true
subscription_plans    | true
subscriptions         | true
workspace_members     | true
workspaces            | true
```

---

## Testing the flow

1. Sign up with a new email or Google account
2. Confirm the profile was auto-created:
   ```sql
   SELECT id, email, role, onboarding_step, trial_ends_at
   FROM profiles ORDER BY created_at DESC LIMIT 5;
   ```
3. Confirm the subscription was auto-created:
   ```sql
   SELECT user_id, plan_id, status, trial_end
   FROM subscriptions ORDER BY created_at DESC LIMIT 5;
   ```
4. Complete the onboarding → verify `onboarding_completed = true`
5. Check that the first workspace was created:
   ```sql
   SELECT id, owner_id, name FROM workspaces ORDER BY created_at DESC LIMIT 5;
   ```

---

## Deprecated files

These scripts in `/scripts/` are from the old schema and are no longer needed:
- `001_create_analytics_tables.sql` ← superseded by `CONDOR-SCHEMA-MIGRATION-V2.0.sql`
- `002_create_profiles_trigger.sql` ← integrated into V2.0 migration

You can safely delete them or keep for reference.