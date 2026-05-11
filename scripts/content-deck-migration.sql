-- ================================================================
-- CONDOR — Content Deck Migration
-- Version: v1.5.0
-- Date: 2026-05-05
-- Description: Creates all tables for the Content Deck module.
--              Run this in Supabase SQL Editor.
-- ================================================================

-- ── 1. content_statuses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_statuses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name         text NOT NULL,
  slug         text NOT NULL,
  color        text,
  order_index  int NOT NULL DEFAULT 0,
  is_default   boolean DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.content_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_statuses_select" ON public.content_statuses
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "content_statuses_insert" ON public.content_statuses
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
    )
  );

CREATE POLICY "content_statuses_update" ON public.content_statuses
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "content_statuses_delete" ON public.content_statuses
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- ── 2. content_items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_items (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id       uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title              text NOT NULL,
  slug               text,
  status             text NOT NULL DEFAULT 'idea',
  content_type       text,
  campaign           text,
  primary_platform   text,
  platforms          text[] DEFAULT '{}',
  author_id          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date           date,
  scheduled_at       timestamptz,
  published_at       timestamptz,
  external_url       text,
  source             text,
  linked_dataset_id  uuid REFERENCES public.analytics_datasets(id) ON DELETE SET NULL,
  linked_post_id     text,
  performance_score  numeric,
  created_by         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now(),
  archived_at        timestamptz
);

CREATE INDEX IF NOT EXISTS content_items_workspace_id_idx ON public.content_items(workspace_id);
CREATE INDEX IF NOT EXISTS content_items_status_idx ON public.content_items(status);
CREATE INDEX IF NOT EXISTS content_items_created_at_idx ON public.content_items(created_at DESC);

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_items_select" ON public.content_items
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "content_items_insert" ON public.content_items
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
    )
  );

CREATE POLICY "content_items_update" ON public.content_items
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
    )
  );

CREATE POLICY "content_items_delete" ON public.content_items
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

-- ── 3. content_versions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  platform        text NOT NULL,
  headline        text,
  body            text,
  cta             text,
  hashtags        text[] DEFAULT '{}',
  notes           text,
  version_number  int DEFAULT 1,
  is_primary      boolean DEFAULT false,
  created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_versions_item_id_idx ON public.content_versions(content_item_id);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_versions_select" ON public.content_versions
  FOR SELECT USING (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "content_versions_insert" ON public.content_versions
  FOR INSERT WITH CHECK (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
      )
    )
  );

CREATE POLICY "content_versions_update" ON public.content_versions
  FOR UPDATE USING (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
      )
    )
  );

CREATE POLICY "content_versions_delete" ON public.content_versions
  FOR DELETE USING (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin')
      )
    )
  );

-- ── 4. content_comments ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_comments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body            text NOT NULL,
  mentioned_user_ids uuid[] DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX IF NOT EXISTS content_comments_item_id_idx ON public.content_comments(content_item_id);

ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_comments_select" ON public.content_comments
  FOR SELECT USING (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "content_comments_insert" ON public.content_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "content_comments_update" ON public.content_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "content_comments_delete" ON public.content_comments
  FOR DELETE USING (user_id = auth.uid());

-- ── 5. content_attachments ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_attachments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  file_url        text,
  file_name       text,
  file_type       text,
  storage_provider text DEFAULT 'supabase',
  external_url    text,
  created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_attachments_item_id_idx ON public.content_attachments(content_item_id);

ALTER TABLE public.content_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_attachments_select" ON public.content_attachments
  FOR SELECT USING (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "content_attachments_insert" ON public.content_attachments
  FOR INSERT WITH CHECK (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
      )
    )
  );

CREATE POLICY "content_attachments_delete" ON public.content_attachments
  FOR DELETE USING (
    created_by = auth.uid() OR
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      )
    )
  );

-- ── 6. content_activity ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_activity (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type      text NOT NULL,
  old_value       text,
  new_value       text,
  metadata        jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_activity_item_id_idx ON public.content_activity(content_item_id);
CREATE INDEX IF NOT EXISTS content_activity_created_at_idx ON public.content_activity(created_at DESC);

ALTER TABLE public.content_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_activity_select" ON public.content_activity
  FOR SELECT USING (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "content_activity_insert" ON public.content_activity
  FOR INSERT WITH CHECK (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ── 7. content_ai_generations ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_ai_generations (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id             uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  content_item_id          uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  source_content_item_id   uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  source_dataset_id        uuid REFERENCES public.analytics_datasets(id) ON DELETE SET NULL,
  source_post_id           text,
  prompt_type              text NOT NULL,
  generated_title          text,
  generated_body           text,
  generated_cta            text,
  generated_hashtags       text[] DEFAULT '{}',
  model                    text,
  tokens_used              int,
  created_by               uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at               timestamptz DEFAULT now()
);

ALTER TABLE public.content_ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_ai_generations_select" ON public.content_ai_generations
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "content_ai_generations_insert" ON public.content_ai_generations
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- ── 8. content_performance_links ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_performance_links (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id      uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  analytics_dataset_id uuid REFERENCES public.analytics_datasets(id) ON DELETE SET NULL,
  platform_post_id     text,
  platform             text,
  matched_by           text DEFAULT 'manual',
  performance_score    numeric,
  metrics_snapshot     jsonb DEFAULT '{}',
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

ALTER TABLE public.content_performance_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_performance_links_select" ON public.content_performance_links
  FOR SELECT USING (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "content_performance_links_insert" ON public.content_performance_links
  FOR INSERT WITH CHECK (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
      )
    )
  );

CREATE POLICY "content_performance_links_update" ON public.content_performance_links
  FOR UPDATE USING (
    content_item_id IN (
      SELECT id FROM public.content_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
      )
    )
  );

-- ── updated_at triggers ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'content_items_updated_at') THEN
    CREATE TRIGGER content_items_updated_at
      BEFORE UPDATE ON public.content_items
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'content_versions_updated_at') THEN
    CREATE TRIGGER content_versions_updated_at
      BEFORE UPDATE ON public.content_versions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'content_comments_updated_at') THEN
    CREATE TRIGGER content_comments_updated_at
      BEFORE UPDATE ON public.content_comments
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'content_statuses_updated_at') THEN
    CREATE TRIGGER content_statuses_updated_at
      BEFORE UPDATE ON public.content_statuses
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
