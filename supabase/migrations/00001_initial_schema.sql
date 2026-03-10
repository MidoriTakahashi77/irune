-- families table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- profiles table
-- Self-registered users have id = auth.users.id
-- Managed members (children etc.) have id = gen_random_uuid() and managed_by set
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  color TEXT NOT NULL DEFAULT '#4ECDC4',
  relationship TEXT NOT NULL DEFAULT 'other' CHECK (relationship IN ('spouse', 'father', 'mother', 'grandpa', 'grandma', 'son', 'daughter', 'brother', 'sister', 'other')),
  relationship_label TEXT,
  birth_order INT,
  managed_by UUID REFERENCES profiles(id) ON DELETE CASCADE
);

-- Cascade delete profile when auth user is deleted
CREATE OR REPLACE FUNCTION handle_auth_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_user_delete();

-- events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'family' CHECK (category IN ('health', 'family', 'errands', 'social')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  reminder BOOLEAN NOT NULL DEFAULT false,
  reminder_minutes INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- diary_entries table
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  entry_date DATE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  mood TEXT,
  location TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- diary_media table
CREATE TABLE diary_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video'))
);

-- notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  note_type TEXT NOT NULL DEFAULT 'free' CHECK (note_type IN ('free', 'my_letter', 'evacuation', 'house')),
  title TEXT NOT NULL,
  body JSONB,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  shared_with UUID[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- emergency_contacts table
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_priority BOOLEAN NOT NULL DEFAULT false
);

-- Helper function to get user's family_id
CREATE OR REPLACE FUNCTION get_user_family_id()
RETURNS UUID AS $$
  SELECT family_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Indexes
CREATE INDEX idx_events_family_start ON events(family_id, start_at);
CREATE INDEX idx_diary_entries_family_date ON diary_entries(family_id, entry_date);
CREATE INDEX idx_profiles_family ON profiles(family_id);
CREATE INDEX idx_profiles_managed_by ON profiles(managed_by);
CREATE INDEX idx_notes_family ON notes(family_id);

-- ============================================
-- Row Level Security Policies
-- ============================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- families: members can read their own family, or any family (needed during creation before profile.family_id is set)
CREATE POLICY "Authenticated users can view families"
  ON families FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create families"
  ON families FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- profiles: members can see family members
CREATE POLICY "Users can view family members"
  ON profiles FOR SELECT
  USING (family_id = get_user_family_id() OR id = auth.uid());

CREATE POLICY "Users can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR managed_by = auth.uid());

CREATE POLICY "Users can update own or managed profiles"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR managed_by = auth.uid());

CREATE POLICY "Users can delete managed members"
  ON profiles FOR DELETE
  USING (managed_by = auth.uid());

-- events: family-scoped CRUD
CREATE POLICY "Users can view family events"
  ON events FOR SELECT
  USING (family_id = get_user_family_id());

CREATE POLICY "Users can create family events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "Event creators can update"
  ON events FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Event creators or admins can delete"
  ON events FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.family_id = events.family_id
    )
  );

-- diary_entries: family-scoped
CREATE POLICY "Users can view family diary entries"
  ON diary_entries FOR SELECT
  USING (family_id = get_user_family_id());

CREATE POLICY "Users can create family diary entries"
  ON diary_entries FOR INSERT
  TO authenticated
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "Diary creators can update"
  ON diary_entries FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Diary creators can delete"
  ON diary_entries FOR DELETE
  USING (created_by = auth.uid());

-- diary_media: accessible if parent diary is accessible
CREATE POLICY "Users can view family diary media"
  ON diary_media FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM diary_entries
    WHERE diary_entries.id = diary_media.diary_id
    AND diary_entries.family_id = get_user_family_id()
  ));

CREATE POLICY "Users can insert diary media"
  ON diary_media FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM diary_entries
    WHERE diary_entries.id = diary_media.diary_id
    AND diary_entries.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete own diary media"
  ON diary_media FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM diary_entries
    WHERE diary_entries.id = diary_media.diary_id
    AND diary_entries.created_by = auth.uid()
  ));

-- notes: family-scoped with locked note restriction
CREATE POLICY "Users can view family notes"
  ON notes FOR SELECT
  USING (
    family_id = get_user_family_id()
    AND (
      is_locked = false
      OR created_by = auth.uid()
      OR auth.uid() = ANY(shared_with)
    )
  );

CREATE POLICY "Users can create family notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "Note creators can update"
  ON notes FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Note creators can delete"
  ON notes FOR DELETE
  USING (created_by = auth.uid());

-- emergency_contacts: family-scoped
CREATE POLICY "Users can view family emergency contacts"
  ON emergency_contacts FOR SELECT
  USING (family_id = get_user_family_id());

CREATE POLICY "Users can manage family emergency contacts"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (family_id = get_user_family_id());

CREATE POLICY "Users can update family emergency contacts"
  ON emergency_contacts FOR UPDATE
  USING (family_id = get_user_family_id());

CREATE POLICY "Users can delete family emergency contacts"
  ON emergency_contacts FOR DELETE
  USING (family_id = get_user_family_id());

-- Storage bucket for diary media
INSERT INTO storage.buckets (id, name, public) VALUES ('diary-media', 'diary-media', true);

CREATE POLICY "Family members can upload diary media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'diary-media');

CREATE POLICY "Anyone can view diary media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'diary-media');

CREATE POLICY "Owners can delete diary media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'diary-media' AND auth.uid()::text = (storage.foldername(name))[1]);
