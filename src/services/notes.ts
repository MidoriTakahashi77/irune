import { supabase } from "@/lib/supabase";
import type { NoteInsert, NoteUpdate } from "@/types/events";

export async function fetchNotes(familyId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("family_id", familyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchNote(id: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function upsertNote(note: NoteInsert & { id?: string }) {
  if (note.id) {
    const { id, ...updates } = note;
    const { data, error } = await supabase
      .from("notes")
      .update(updates as NoteUpdate)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("notes")
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNote(id: string) {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}
