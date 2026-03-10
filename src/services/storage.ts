import { supabase } from "@/lib/supabase";

export async function uploadMedia(
  familyId: string,
  fileName: string,
  fileUri: string,
  mimeType: string
) {
  const path = `${familyId}/${Date.now()}_${fileName}`;

  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from("diary-media")
    .upload(path, blob, { contentType: mimeType });

  if (error) throw error;
  return data.path;
}

export function getMediaUrl(path: string) {
  const { data } = supabase.storage.from("diary-media").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteMedia(path: string) {
  const { error } = await supabase.storage.from("diary-media").remove([path]);
  if (error) throw error;
}
