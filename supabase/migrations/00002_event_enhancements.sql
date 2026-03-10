-- Add color, recurrence, and assigned_to columns to events
ALTER TABLE events ADD COLUMN color TEXT NOT NULL DEFAULT '#208AEF';
ALTER TABLE events ADD COLUMN recurrence TEXT CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'yearly'));
ALTER TABLE events ADD COLUMN assigned_to UUID[] NOT NULL DEFAULT '{}';
