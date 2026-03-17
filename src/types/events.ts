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
export type NoteRow = Database["public"]["Tables"]["notes"]["Row"];
export type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
export type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];

export type MemberDetailRow =
  Database["public"]["Tables"]["member_details"]["Row"];
export type MemberDetailInsert =
  Database["public"]["Tables"]["member_details"]["Insert"];
export type MemberDetailUpdate =
  Database["public"]["Tables"]["member_details"]["Update"];

export type TrustedContactRow = {
  id: string;
  family_id: string;
  profile_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  relationship: string;
  type: TrustedContactType;
  is_sos_target: boolean;
  created_by: string;
  created_at: string;
};

export type TrustedContactInsert = Omit<TrustedContactRow, "id" | "created_at">;
export type TrustedContactUpdate = Partial<Omit<TrustedContactRow, "id" | "created_at">>;
export type TrustedContactType = "family" | "friend" | "professional";

export type NotebookPageRow =
  Database["public"]["Tables"]["notebook_pages"]["Row"];
export type NotebookPageInsert =
  Database["public"]["Tables"]["notebook_pages"]["Insert"];
export type NotebookPageUpdate =
  Database["public"]["Tables"]["notebook_pages"]["Update"];

export type NoteType =
  | "free"
  | "my_letter"
  | "evacuation"
  | "house"
  | "life_profile"
  | "life_medical"
  | "life_care"
  | "life_funeral"
  | "life_burial"
  | "life_assets"
  | "life_contracts"
  | "life_digital"
  | "life_pension"
  | "life_pet"
  | "life_will"
  | "life_keepsake"
  | "life_message"
  | "life_history";

export type ProfileWithDetails = ProfileRow & {
  member_details: MemberDetailRow[];
};

export type NoteWithPageCount = NoteRow & {
  notebook_pages: { count: number }[];
};

export type VisibilityMode = "all" | "owner" | "custom";

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
