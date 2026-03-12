-- ============================================
-- notebook_pages テーブル新設
-- ============================================
CREATE TABLE notebook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notebook_pages_note ON notebook_pages(note_id);
CREATE INDEX idx_notebook_pages_position ON notebook_pages(note_id, position);

ALTER TABLE notebook_pages ENABLE ROW LEVEL SECURITY;

-- 家族メンバーは閲覧可
CREATE POLICY "Family members can view notebook pages"
  ON notebook_pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM notes n
    WHERE n.id = notebook_pages.note_id
    AND n.family_id = get_user_family_id()
  ));

-- 家族メンバーはページ追加可
CREATE POLICY "Family members can insert notebook pages"
  ON notebook_pages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM notes n
    WHERE n.id = notebook_pages.note_id
    AND n.family_id = get_user_family_id()
  ));

-- ノート作成者が編集可
CREATE POLICY "Note creator can update notebook pages"
  ON notebook_pages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM notes n
    WHERE n.id = notebook_pages.note_id
    AND n.created_by = auth.uid()
  ));

-- ノート作成者が削除可
CREATE POLICY "Note creator can delete notebook pages"
  ON notebook_pages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM notes n
    WHERE n.id = notebook_pages.note_id
    AND n.created_by = auth.uid()
  ));

-- ============================================
-- 既存 JSONB データの移行
-- ============================================
INSERT INTO notebook_pages (note_id, title, content, position, created_at)
SELECT
  n.id,
  COALESCE(p.val->>'title', ''),
  COALESCE(p.val->>'content', ''),
  (p.idx - 1)::int,
  COALESCE((p.val->>'created_at')::timestamptz, n.created_at)
FROM notes n,
LATERAL jsonb_array_elements(n.body->'pages') WITH ORDINALITY AS p(val, idx)
WHERE n.note_type = 'free'
  AND n.body IS NOT NULL
  AND n.body ? 'pages'
  AND jsonb_array_length(n.body->'pages') > 0;

-- 移行済みノートの body をクリア
UPDATE notes SET body = NULL
WHERE note_type = 'free'
  AND body IS NOT NULL
  AND body ? 'pages';
