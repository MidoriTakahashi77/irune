import type { Database } from "./database";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

export type DiaryEntryRow =
  Database["public"]["Tables"]["diary_entries"]["Row"];
export type DiaryEntryInsert =
  Database["public"]["Tables"]["diary_entries"]["Insert"];

export type DiaryMediaRow = Database["public"]["Tables"]["diary_media"]["Row"];

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type FamilyRow = Database["public"]["Tables"]["families"]["Row"];

export type EventCategory = "health" | "family" | "errands" | "social";
export type NoteType = "free" | "my_letter" | "evacuation" | "house";
export type Relationship =
  | "spouse"
  | "father"
  | "mother"
  | "grandpa"
  | "grandma"
  | "son"
  | "daughter"
  | "brother"
  | "sister"
  | "other";
