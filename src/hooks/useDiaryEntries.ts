import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDiaryEntries,
  fetchDiaryEntry,
  createDiaryEntry,
  deleteDiaryEntry,
} from "@/services/diary";
import type { DiaryEntryInsert } from "@/types/events";

export function useDiaryEntries(
  familyId: string | null | undefined,
  start: string,
  end: string
) {
  return useQuery({
    queryKey: ["diary-entries", familyId, start, end],
    queryFn: () => fetchDiaryEntries(familyId!, start, end),
    enabled: !!familyId,
  });
}

export function useDiaryEntry(id: string | undefined) {
  return useQuery({
    queryKey: ["diary-entry", id],
    queryFn: () => fetchDiaryEntry(id!),
    enabled: !!id,
  });
}

export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry: DiaryEntryInsert) => createDiaryEntry(entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-entries"] });
    },
  });
}

export function useDeleteDiaryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDiaryEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary-entries"] });
    },
  });
}
