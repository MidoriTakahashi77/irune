import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";

export async function createFamily(name: string) {
  const { data, error } = await supabase
    .from("families")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchFamily(familyId: string) {
  const { data, error } = await supabase
    .from("families")
    .select()
    .eq("id", familyId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchFamilyMembers(familyId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, member_details(*)")
    .eq("family_id", familyId);

  if (error) throw error;
  return data;
}

export async function sendFamilyInvite(
  email: string,
  familyId: string
) {
  const redirectTo = Linking.createURL(`/invite`, {
    queryParams: { family_id: familyId },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) throw error;
}

const CHILD_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
];

export async function addManagedMember(
  familyId: string,
  managedBy: string,
  displayName: string
) {
  const color =
    CHILD_COLORS[Math.floor(Math.random() * CHILD_COLORS.length)];
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      family_id: familyId,
      display_name: displayName,
      managed_by: managedBy,
      role: "member",
      color,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteManagedMember(memberId: string) {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", memberId);
  if (error) throw error;
}
