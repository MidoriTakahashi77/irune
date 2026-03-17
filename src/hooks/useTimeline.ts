import { useEffect } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchTimelinePosts,
  createTimelinePost,
  deleteTimelinePost,
  getLastRead,
  updateLastRead,
} from "@/services/timeline";
import type { TimelinePostInsert } from "@/types/events";

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

export function useMarkAsRead(
  userId: string | null | undefined,
  familyId: string | null | undefined,
  newestPostAt: string | null
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !familyId || !newestPostAt) return;
    updateLastRead(userId, familyId, newestPostAt).then(() => {
      queryClient.setQueryData(["timeline-last-read", userId], newestPostAt);
    });
  }, [userId, familyId, newestPostAt]);
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: TimelinePostInsert) => createTimelinePost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
    },
  });
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
