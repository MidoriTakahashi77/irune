-- timeline_posts に引用返信 + メンション追加
ALTER TABLE timeline_posts
  ADD COLUMN reply_to_id UUID REFERENCES timeline_posts(id) ON DELETE SET NULL,
  ADD COLUMN mentions UUID[] DEFAULT '{}';

CREATE INDEX idx_timeline_posts_reply ON timeline_posts (reply_to_id) WHERE reply_to_id IS NOT NULL;
