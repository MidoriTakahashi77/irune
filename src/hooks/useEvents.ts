import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const query = useQuery({
    queryKey: ["events", familyId, start, end],
    queryFn: () => fetchEvents(familyId!, start, end),
    enabled: !!familyId,
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
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
