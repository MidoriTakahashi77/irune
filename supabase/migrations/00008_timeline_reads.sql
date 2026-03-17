-- 既読位置トラッキング
CREATE TABLE timeline_reads (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE timeline_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_reads_own" ON timeline_reads
  FOR ALL USING (user_id = auth.uid());
