import { supabase } from "@/lib/supabase";
import type { EventInsert, EventUpdate } from "@/types/events";

export async function fetchEvents(familyId: string, start: string, end: string) {
  // 1クエリで全イベント取得（非繰り返し: 日付範囲内、繰り返し: start_at <= end）
  // OR条件: (recurrence IS NULL AND start_at >= start AND start_at <= end) OR (recurrence IS NOT NULL AND start_at <= end)
  const { data, error } = await supabase
    .from("events")
    .select("*, profiles:created_by(display_name, color)")
    .eq("family_id", familyId)
    .or(`and(recurrence.is.null,start_at.gte.${start},start_at.lte.${end}),and(recurrence.not.is.null,start_at.lte.${end})`)
    .order("start_at", { ascending: true });

  if (error) throw error;

  const regular = (data ?? []).filter((e) => !e.recurrence);
  const recurring = (data ?? []).filter((e) => e.recurrence);
  return { regular, recurring };
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
