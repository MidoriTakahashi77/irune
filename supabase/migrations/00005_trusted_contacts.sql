-- ============================================
-- trusted_contacts: 家族メンバー + 外部連絡先の統合管理
-- ============================================

CREATE TABLE trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relationship TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'family'
    CHECK (type IN ('family', 'friend', 'professional')),
  is_sos_target BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trusted_contacts_select"
  ON trusted_contacts FOR SELECT
  USING (family_id = get_user_family_id());

CREATE POLICY "trusted_contacts_insert"
  ON trusted_contacts FOR INSERT
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "trusted_contacts_update"
  ON trusted_contacts FOR UPDATE
  USING (family_id = get_user_family_id());

CREATE POLICY "trusted_contacts_delete"
  ON trusted_contacts FOR DELETE
  USING (family_id = get_user_family_id());

-- ============================================
-- emergency_contacts → trusted_contacts へデータ移行
-- ============================================

INSERT INTO trusted_contacts (family_id, name, email, phone, relationship, type, is_sos_target, created_by)
SELECT
  ec.family_id,
  ec.name,
  ec.email,
  ec.phone,
  ec.relationship,
  CASE ec.category
    WHEN 'emergency' THEN 'friend'
    WHEN 'professional' THEN 'professional'
    WHEN 'death_notification' THEN 'friend'
    ELSE 'friend'
  END,
  ec.category = 'emergency',
  (SELECT p.id FROM profiles p WHERE p.family_id = ec.family_id AND p.role = 'admin' LIMIT 1)
FROM emergency_contacts ec;

-- 旧テーブルを削除
DROP TABLE emergency_contacts;
