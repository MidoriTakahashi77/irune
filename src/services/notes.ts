import { supabase } from "@/lib/supabase";
import type { NoteInsert, NoteUpdate, NotebookPageInsert, NotebookPageUpdate } from "@/types/events";

// ── Notes ──

export async function fetchNotes(familyId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*, notebook_pages(count)")
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

// ── Notebook Pages ──

export async function fetchNotebookPages(noteId: string) {
  const { data, error } = await supabase
    .from("notebook_pages")
    .select("*")
    .eq("note_id", noteId)
    .order("position");

  if (error) throw error;
  return data;
}

export async function createNotebookPage(page: NotebookPageInsert) {
  const { data, error } = await supabase
    .from("notebook_pages")
    .insert(page)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNotebookPage(id: string, updates: NotebookPageUpdate) {
  const { data, error } = await supabase
    .from("notebook_pages")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNotebookPage(id: string) {
  const { error } = await supabase
    .from("notebook_pages")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
