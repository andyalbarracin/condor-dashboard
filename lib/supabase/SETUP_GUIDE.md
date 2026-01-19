# Supabase Setup Guide for CONDOR Dashboard

## Database Schema Creation

The database schema is defined in SQL migration scripts in the `/scripts` folder:

### Step 1: Run 001_create_analytics_tables.sql
This creates the core tables with Row Level Security:
- `profiles` - User profiles
- `analytics_datasets` - Uploaded analytics data
- `analytics_metrics` - Normalized metrics

To run:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query and paste the contents of `scripts/001_create_analytics_tables.sql`
4. Execute

### Step 2: Run 002_create_profiles_trigger.sql
This creates the trigger that auto-generates profiles on signup.

To run:
1. In SQL Editor, create a new query
2. Paste the contents of `scripts/002_create_profiles_trigger.sql`
3. Execute

## Environment Variables

Verify these are in your `.env.local` (they're auto-set by Vercel Supabase integration):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Row Level Security (RLS)

All user-related tables have RLS enabled. This means:
- Users can only access their own data
- Auth rules are enforced at the database level
- Email confirmation is required before RLS-protected operations work

## Testing the Setup

1. Sign up a new user
2. Check Supabase dashboard to verify profile was auto-created
3. Upload a CSV file - it should save to `analytics_datasets`
