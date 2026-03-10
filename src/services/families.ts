import { supabase } from "@/lib/supabase";

export async function createFamily(name: string) {
  const inviteCode = generateInviteCode();
  const { data, error } = await supabase
    .from("families")
    .insert({ name, invite_code: inviteCode })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinFamily(inviteCode: string) {
  const { data, error } = await supabase
    .from("families")
    .select()
    .eq("invite_code", inviteCode.toUpperCase())
    .single();

  if (error) throw error;
  return data;
}

export async function fetchFamilyMembers(familyId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("family_id", familyId);

  if (error) throw error;
  return data;
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
