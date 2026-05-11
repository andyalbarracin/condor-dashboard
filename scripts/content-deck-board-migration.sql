-- ================================================================
-- CONDOR — Content Deck Board Module Migration
-- Version: v2.0.0
-- Date: 2026-05-08
-- Description: Adds monday.com-style board/group/item tables
--              alongside the existing content_items module.
--              Run this in Supabase SQL Editor.
-- ================================================================

-- ── 1. content_boards ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_boards (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name         text NOT NULL DEFAULT 'Content Board',
  description  text,
  board_type   text NOT NULL DEFAULT 'content',
  health_status text,
  created_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_boards_workspace_idx ON public.content_boards(workspace_id);

ALTER TABLE public.content_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_boards_select" ON public.content_boards
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "content_boards_insert" ON public.content_boards
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
    )
  );

CREATE POLICY "content_boards_update" ON public.content_boards
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
    )
  );

CREATE POLICY "content_boards_delete" ON public.content_boards
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
    )
  );

-- ── 2. content_groups ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    uuid NOT NULL REFERENCES public.content_boards(id) ON DELETE CASCADE,
  name        text NOT NULL,
  color       text NOT NULL DEFAULT '#0d9488',
  order_index int NOT NULL DEFAULT 0,
  collapsed   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_groups_board_idx ON public.content_groups(board_id);

ALTER TABLE public.content_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_groups_select" ON public.content_groups
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM public.content_boards WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "content_groups_insert" ON public.content_groups
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT id FROM public.content_boards WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
      )
    )
  );

CREATE POLICY "content_groups_update" ON public.content_groups
  FOR UPDATE USING (
    board_id IN (
      SELECT id FROM public.content_boards WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
      )
    )
  );

CREATE POLICY "content_groups_delete" ON public.content_groups
  FOR DELETE USING (
    board_id IN (
      SELECT id FROM public.content_boards WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      )
    )
  );

-- ── 3. content_board_items ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_board_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id         uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  board_id             uuid NOT NULL REFERENCES public.content_boards(id) ON DELETE CASCADE,
  group_id             uuid NOT NULL REFERENCES public.content_groups(id) ON DELETE CASCADE,
  title                text NOT NULL,
  owner_id             uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status               text NOT NULL DEFAULT 'not_started',
  platform             text,
  buyer_stage          text,
  due_date             date,
  start_date           date,
  link_url             text,
  dependency_item_id   uuid REFERENCES public.content_board_items(id) ON DELETE SET NULL,
  order_index          int NOT NULL DEFAULT 0,
  priority             text,
  item_type            text,
  body                 text,
  created_by           uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_board_items_board_idx    ON public.content_board_items(board_id);
CREATE INDEX IF NOT EXISTS content_board_items_group_idx    ON public.content_board_items(group_id);
CREATE INDEX IF NOT EXISTS content_board_items_status_idx   ON public.content_board_items(status);
CREATE INDEX IF NOT EXISTS content_board_items_created_idx  ON public.content_board_items(created_at DESC);

ALTER TABLE public.content_board_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_board_items_select" ON public.content_board_items
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "content_board_items_insert" ON public.content_board_items
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
    )
  );

CREATE POLICY "content_board_items_update" ON public.content_board_items
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin','editor')
    )
  );

CREATE POLICY "content_board_items_delete" ON public.content_board_items
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      UNION
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner','admin')
    )
  );

-- ── 4. content_board_updates ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.content_board_updates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     uuid NOT NULL REFERENCES public.content_board_items(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body        text NOT NULL,
  update_type text NOT NULL DEFAULT 'comment',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_board_updates_item_idx ON public.content_board_updates(item_id);

ALTER TABLE public.content_board_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_board_updates_select" ON public.content_board_updates
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM public.content_board_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "content_board_updates_insert" ON public.content_board_updates
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    item_id IN (
      SELECT id FROM public.content_board_items WHERE workspace_id IN (
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
        UNION
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "content_board_updates_delete" ON public.content_board_updates
  FOR DELETE USING (author_id = auth.uid());

-- ── 5. Seed: create a default board for each workspace ───────────
-- Run this only if you want to auto-create a default board:
-- INSERT INTO public.content_boards (workspace_id, name, board_type)
-- SELECT id, 'Content Board', 'content'
-- FROM public.workspaces
-- ON CONFLICT DO NOTHING;

-- ── 6. Updated_at triggers ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'content_boards_updated_at') THEN
    CREATE TRIGGER content_boards_updated_at
      BEFORE UPDATE ON public.content_boards
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'content_groups_updated_at') THEN
    CREATE TRIGGER content_groups_updated_at
      BEFORE UPDATE ON public.content_groups
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'content_board_items_updated_at') THEN
    CREATE TRIGGER content_board_items_updated_at
      BEFORE UPDATE ON public.content_board_items
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'content_board_updates_updated_at') THEN
    CREATE TRIGGER content_board_updates_updated_at
      BEFORE UPDATE ON public.content_board_updates
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
