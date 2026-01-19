-- Create profiles table (for user management)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create analytics datasets table
create table if not exists public.analytics_datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  source text not null check (source in ('linkedin_followers', 'linkedin_content', 'x_account', 'custom')),
  data jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create analytics metrics table (denormalized for performance)
create table if not exists public.analytics_metrics (
  id uuid primary key default gen_random_uuid(),
  dataset_id uuid not null references public.analytics_datasets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  metric_name text not null,
  metric_value numeric not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.analytics_datasets enable row level security;
alter table public.analytics_metrics enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Analytics datasets policies
create policy "analytics_datasets_select_own"
  on public.analytics_datasets for select
  using (auth.uid() = user_id);

create policy "analytics_datasets_insert_own"
  on public.analytics_datasets for insert
  with check (auth.uid() = user_id);

create policy "analytics_datasets_update_own"
  on public.analytics_datasets for update
  using (auth.uid() = user_id);

create policy "analytics_datasets_delete_own"
  on public.analytics_datasets for delete
  using (auth.uid() = user_id);

-- Analytics metrics policies
create policy "analytics_metrics_select_own"
  on public.analytics_metrics for select
  using (auth.uid() = user_id);

create policy "analytics_metrics_insert_own"
  on public.analytics_metrics for insert
  with check (auth.uid() = user_id);
