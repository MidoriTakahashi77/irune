import { supabase } from "@/lib/supabase";
import type {
  EmergencyContactInsert,
  EmergencyContactUpdate,
} from "@/types/events";

export async function fetchEmergencyContacts(familyId: string) {
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("family_id", familyId)
    .order("is_priority", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createEmergencyContact(
  contact: EmergencyContactInsert
) {
  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert(contact)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmergencyContact(
  id: string,
  updates: EmergencyContactUpdate
) {
  const { data, error } = await supabase
    .from("emergency_contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEmergencyContact(id: string) {
  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
