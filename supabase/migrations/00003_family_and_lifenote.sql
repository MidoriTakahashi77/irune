-- ============================================
-- Step 1-1: member_details テーブル新設
-- ============================================
CREATE TABLE member_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  full_name_kana TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT CHECK (blood_type IN ('A', 'B', 'O', 'AB')),
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_member_details_profile ON member_details(profile_id);

ALTER TABLE member_details ENABLE ROW LEVEL SECURITY;

-- 家族メンバーは閲覧可
CREATE POLICY "Family members can view member details"
  ON member_details FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = member_details.profile_id
    AND p.family_id = get_user_family_id()
  ));

-- 本人 or managed_by が編集可
CREATE POLICY "Users can insert own or managed member details"
  ON member_details FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = member_details.profile_id
      AND p.managed_by = auth.uid()
    )
  );

CREATE POLICY "Users can update own or managed member details"
  ON member_details FOR UPDATE
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = member_details.profile_id
      AND p.managed_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete own or managed member details"
  ON member_details FOR DELETE
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = member_details.profile_id
      AND p.managed_by = auth.uid()
    )
  );

-- ============================================
-- Step 1-2: notes テーブル拡張
-- ============================================

-- subject_id カラム追加（NULL = 本人）
ALTER TABLE notes ADD COLUMN subject_id UUID REFERENCES profiles(id);

-- note_type の CHECK 制約を更新
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_note_type_check;
ALTER TABLE notes ADD CONSTRAINT notes_note_type_check CHECK (
  note_type IN (
    'free', 'my_letter', 'evacuation', 'house',
    'life_profile', 'life_medical', 'life_care',
    'life_funeral', 'life_burial', 'life_assets',
    'life_contracts', 'life_digital', 'life_pension',
    'life_pet', 'life_will', 'life_keepsake',
    'life_message', 'life_history'
  )
);

CREATE INDEX idx_notes_subject ON notes(subject_id);

-- ============================================
-- Step 1-3: emergency_contacts テーブル拡張
-- ============================================

ALTER TABLE emergency_contacts
  ADD COLUMN category TEXT NOT NULL DEFAULT 'emergency'
    CHECK (category IN ('emergency', 'death_notification', 'professional')),
  ADD COLUMN email TEXT,
  ADD COLUMN address TEXT,
  ADD COLUMN notes TEXT;
