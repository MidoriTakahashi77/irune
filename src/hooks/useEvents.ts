import { useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import {
  fetchEvents,
  fetchEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/services/events";
import { expandRecurringEvents } from "@/utils/recurrence";
import type { EventInsert, EventUpdate } from "@/types/events";

export function useEvents(
  familyId: string | null | undefined,
  start: string,
  end: string
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["events", familyId, start, end],
    queryFn: () => fetchEvents(familyId!, start, end),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // 前後1ヶ月をプリフェッチ（スクロール時のデータ待ちを解消）
  useEffect(() => {
    if (!familyId) return;
    const current = new Date(start);
    for (const offset of [-1, 1]) {
      const m = offset > 0 ? addMonths(current, offset) : subMonths(current, -offset);
      const prefetchStart = startOfMonth(m).toISOString();
      const prefetchEnd = endOfMonth(m).toISOString();
      queryClient.prefetchQuery({
        queryKey: ["events", familyId, prefetchStart, prefetchEnd],
        queryFn: () => fetchEvents(familyId, prefetchStart, prefetchEnd),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [familyId, start]);

  const data = useMemo(() => {
    if (!query.data) return [];
    const { regular, recurring } = query.data;
    const expanded = expandRecurringEvents(recurring, start, end);
    return [...regular, ...expanded].sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );
  }, [query.data, start, end]);

  return { ...query, data };
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event: EventInsert) => createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: EventUpdate }) =>
      updateEvent(id, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
