import { useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  fetchTimelinePosts,
  createTimelinePost,
  deleteTimelinePost,
  getLastRead,
  updateLastRead,
} from "@/services/timeline";
import type {
  TimelinePostInsert,
  TimelinePostWithDetails,
  ProfileRow,
} from "@/types/events";

type TimelinePages = InfiniteData<TimelinePostWithDetails[]>;

export function useTimeline(familyId: string | null | undefined) {
  return useInfiniteQuery({
    queryKey: ["timeline", familyId],
    queryFn: ({ pageParam }) =>
      fetchTimelinePosts(familyId!, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < 20) return undefined;
      return lastPage[lastPage.length - 1]?.created_at;
    },
    enabled: !!familyId,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useLastRead(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["timeline-last-read", userId],
    queryFn: () => getLastRead(userId!),
    enabled: !!userId,
    staleTime: Infinity,
  });
}

/** 画面がバックグラウンドに入る or アンマウント時のみ既読更新 */
export function useMarkAsRead(
  userId: string | null | undefined,
  familyId: string | null | undefined,
  newestPostAt: string | null
) {
  const queryClient = useQueryClient();
  const latestRef = useRef(newestPostAt);
  latestRef.current = newestPostAt;

  useEffect(() => {
    if (!userId || !familyId) return;

    const flush = () => {
      const ts = latestRef.current;
      if (!ts) return;
      updateLastRead(userId, familyId, ts)
        .then(() => {
          queryClient.setQueryData(["timeline-last-read", userId], ts);
        })
        .catch(() => {});
    };

    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") flush();
    });

    return () => {
      sub.remove();
      flush();
    };
  }, [userId, familyId, queryClient]);
}

interface CreatePostParams {
  post: TimelinePostInsert;
  profile: Pick<ProfileRow, "display_name" | "color">;
  replyTo?: TimelinePostWithDetails | null;
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ post }: CreatePostParams) => createTimelinePost(post),

    onMutate: async ({ post, profile, replyTo }) => {
      await queryClient.cancelQueries({ queryKey: ["timeline"] });

      const prev = queryClient.getQueriesData<TimelinePages>({
        queryKey: ["timeline"],
      });

      // 楽観的な投稿を生成
      const tempId = `_temp_${Date.now()}`;
      const optimisticPost: TimelinePostWithDetails = {
        id: tempId,
        family_id: post.family_id,
        author_id: post.author_id,
        type: post.type ?? "post",
        body: post.body ?? null,
        ref_id: post.ref_id ?? null,
        ref_summary: post.ref_summary ?? null,
        reply_to_id: post.reply_to_id ?? null,
        mentions: post.mentions ?? [],
        created_at: new Date().toISOString(),
        profiles: profile,
        reply_to: replyTo
          ? {
              id: replyTo.id,
              body: replyTo.body,
              type: replyTo.type,
              ref_summary: replyTo.ref_summary,
              author_id: replyTo.author_id,
              profiles: replyTo.profiles,
            }
          : null,
        _optimistic: true,
      };

      // DESC 順の先頭 (= inverted で最下部 = 最新) に挿入
      queryClient.setQueriesData<TimelinePages>(
        { queryKey: ["timeline"] },
        (old) => {
          if (!old) return old;
          const pages = [...old.pages];
          pages[0] = [optimisticPost, ...pages[0]];
          return { ...old, pages };
        }
      );

      return { prev, tempId };
    },

    onSuccess: (_serverPost, _vars, context) => {
      if (!context) return;
      // key (id) を変えずに _optimistic フラグだけ落とす
      // → FlatList の key が変わらないのでチラつかない
      // 実IDへの差し替えは次回 refetch で自然に行われる
      queryClient.setQueriesData<TimelinePages>(
        { queryKey: ["timeline"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((p) =>
                p.id === context.tempId
                  ? { ...p, _optimistic: false }
                  : p
              )
            ),
          };
        }
      );
    },

    onError: (_err, _vars, context) => {
      if (!context) return;
      // 仮投稿にエラーフラグを立てる
      queryClient.setQueriesData<TimelinePages>(
        { queryKey: ["timeline"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((p) =>
                p.id === context.tempId
                  ? { ...p, _optimistic: false, _error: true }
                  : p
              )
            ),
          };
        }
      );
    },
  });
}

/** エラーになった投稿を再試行 */
export function useRetryPost() {
  const queryClient = useQueryClient();
  const createPost = useCreatePost();

  return useCallback(
    (failedPost: TimelinePostWithDetails) => {
      // エラー投稿をキャッシュから削除
      queryClient.setQueriesData<TimelinePages>(
        { queryKey: ["timeline"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.filter((p) => p.id !== failedPost.id)
            ),
          };
        }
      );

      // 再投稿
      createPost.mutate({
        post: {
          family_id: failedPost.family_id,
          author_id: failedPost.author_id,
          type: failedPost.type,
          body: failedPost.body,
          reply_to_id: failedPost.reply_to_id,
          mentions: failedPost.mentions,
        },
        profile: failedPost.profiles ?? {
          display_name: "?",
          color: "#999",
        },
        replyTo: failedPost.reply_to
          ? (failedPost as TimelinePostWithDetails)
          : null,
      });
    },
    [queryClient, createPost]
  );
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTimelinePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
    },
  });
}
