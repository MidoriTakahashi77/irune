import { supabase } from "@/lib/supabase";
import type { TimelinePostInsert } from "@/types/events";

const POST_SELECT = `
  *,
  profiles:author_id(display_name, color),
  reply_to:reply_to_id(id, body, type, ref_summary, author_id, profiles:author_id(display_name, color))
`;

export async function fetchTimelinePosts(
  familyId: string,
  cursor?: string,
  limit = 20
) {
  let query = supabase
    .from("timeline_posts")
    .select(POST_SELECT)
    .eq("family_id", familyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createTimelinePost(post: TimelinePostInsert) {
  const { data, error } = await supabase
    .from("timeline_posts")
    .insert(post)
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTimelinePost(id: string) {
  const { error } = await supabase
    .from("timeline_posts")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/** 既読位置の取得 */
export async function getLastRead(userId: string) {
  const { data } = await supabase
    .from("timeline_reads")
    .select("last_read_at")
    .eq("user_id", userId)
    .single();
  return data?.last_read_at ?? null;
}

/** 既読位置の更新 (upsert) */
export async function updateLastRead(
  userId: string,
  familyId: string,
  lastReadAt: string
) {
  const { error } = await supabase.from("timeline_reads").upsert(
    { user_id: userId, family_id: familyId, last_read_at: lastReadAt },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}
