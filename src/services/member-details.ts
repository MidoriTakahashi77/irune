import { supabase } from "@/lib/supabase";
import type { MemberDetailInsert, MemberDetailUpdate } from "@/types/events";

export async function fetchMemberDetails(profileId: string) {
  const { data, error } = await supabase
    .from("member_details")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function upsertMemberDetails(
  profileId: string,
  details: Omit<MemberDetailInsert, "profile_id">
) {
  const { data: existing } = await supabase
    .from("member_details")
    .select("id")
    .eq("profile_id", profileId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("member_details")
      .update(details as MemberDetailUpdate)
      .eq("profile_id", profileId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("member_details")
    .insert({ ...details, profile_id: profileId })
    .select()
    .single();

  if (error) throw error;
  return data;
}
