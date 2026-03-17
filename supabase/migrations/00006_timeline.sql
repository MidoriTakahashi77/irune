-- タイムライン投稿
CREATE TABLE timeline_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post', 'event', 'diary', 'note')),
  body TEXT,
  ref_id UUID,
  ref_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_posts_feed ON timeline_posts (family_id, created_at DESC);

-- タイムラインコメント
CREATE TABLE timeline_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_timeline_comments_post ON timeline_comments (post_id, created_at ASC);

-- タイムラインリアクション (Phase 3用、スキーマのみ)
CREATE TABLE timeline_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES timeline_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, author_id, emoji)
);

-- RLS有効化
ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_reactions ENABLE ROW LEVEL SECURITY;

-- timeline_posts RLS
CREATE POLICY "timeline_posts_select" ON timeline_posts
  FOR SELECT USING (family_id = get_user_family_id());

CREATE POLICY "timeline_posts_insert" ON timeline_posts
  FOR INSERT WITH CHECK (family_id = get_user_family_id() AND author_id = auth.uid());

CREATE POLICY "timeline_posts_update" ON timeline_posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "timeline_posts_delete" ON timeline_posts
  FOR DELETE USING (author_id = auth.uid());

-- timeline_comments RLS (family_idチェックはpostsのJOIN経由)
CREATE POLICY "timeline_comments_select" ON timeline_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM timeline_posts WHERE id = post_id AND family_id = get_user_family_id())
  );

CREATE POLICY "timeline_comments_insert" ON timeline_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM timeline_posts WHERE id = post_id AND family_id = get_user_family_id())
  );

CREATE POLICY "timeline_comments_update" ON timeline_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "timeline_comments_delete" ON timeline_comments
  FOR DELETE USING (author_id = auth.uid());

-- timeline_reactions RLS
CREATE POLICY "timeline_reactions_select" ON timeline_reactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM timeline_posts WHERE id = post_id AND family_id = get_user_family_id())
  );

CREATE POLICY "timeline_reactions_insert" ON timeline_reactions
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM timeline_posts WHERE id = post_id AND family_id = get_user_family_id())
  );

CREATE POLICY "timeline_reactions_delete" ON timeline_reactions
  FOR DELETE USING (author_id = auth.uid());
