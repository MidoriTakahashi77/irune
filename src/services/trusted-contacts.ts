import { supabase } from "@/lib/supabase";
import type { TrustedContactInsert, TrustedContactUpdate } from "@/types/events";

export async function fetchTrustedContacts(familyId: string) {
  const { data, error } = await supabase
    .from("trusted_contacts")
    .select("*")
    .eq("family_id", familyId)
    .order("is_sos_target", { ascending: false })
    .order("type", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTrustedContact(contact: TrustedContactInsert) {
  const { data, error } = await supabase
    .from("trusted_contacts")
    .insert(contact)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrustedContact(id: string, updates: TrustedContactUpdate) {
  const { data, error } = await supabase
    .from("trusted_contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTrustedContact(id: string) {
  const { error } = await supabase
    .from("trusted_contacts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function sendSosEmails(familyId: string, senderName: string) {
  const { data, error } = await supabase.functions.invoke("send-sos", {
    body: { familyId, senderName },
  });
  if (error) throw error;
  return data as { success: boolean; sent: number; total: number };
}
