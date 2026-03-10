import { supabase } from "@/lib/supabase";
import type { DiaryEntryInsert } from "@/types/events";

export async function fetchDiaryEntries(
  familyId: string,
  start: string,
  end: string
) {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*, diary_media(*), profiles:created_by(display_name, avatar_url)")
    .eq("family_id", familyId)
    .gte("entry_date", start)
    .lte("entry_date", end)
    .order("entry_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchDiaryEntry(id: string) {
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*, diary_media(*), profiles:created_by(display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDiaryEntry(entry: DiaryEntryInsert) {
  const { data, error } = await supabase
    .from("diary_entries")
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDiaryEntry(id: string) {
  const { error } = await supabase
    .from("diary_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
