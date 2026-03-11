import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotes, fetchNote, upsertNote, deleteNote } from "@/services/notes";
import type { NoteInsert } from "@/types/events";

export function useNotes(familyId: string | null | undefined) {
  return useQuery({
    queryKey: ["notes", familyId],
    queryFn: () => fetchNotes(familyId!),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useNote(id: string | undefined) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNote(id!),
    enabled: !!id,
  });
}

export function useUpsertNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: NoteInsert & { id?: string }) => upsertNote(note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ["note", variables.id] });
      }
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
