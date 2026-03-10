import { supabase } from "@/lib/supabase";
import type { EventInsert, EventUpdate } from "@/types/events";

export async function fetchEvents(familyId: string, start: string, end: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*, profiles:created_by(display_name, color)")
    .eq("family_id", familyId)
    .gte("start_at", start)
    .lte("start_at", end)
    .order("start_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchEvent(id: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*, profiles:created_by(display_name, color)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEvent(event: EventInsert) {
  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, updates: EventUpdate) {
  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
