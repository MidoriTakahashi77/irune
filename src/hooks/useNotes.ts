import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  fetchNotes,
  fetchNote,
  upsertNote,
  deleteNote,
  fetchNotebookPages,
  createNotebookPage,
  updateNotebookPage,
  deleteNotebookPage,
} from "@/services/notes";
import type { NoteInsert, NotebookPageInsert, NotebookPageUpdate } from "@/types/events";

// ── Notes ──

export function useNotes(familyId: string | null | undefined) {
  return useQuery({
    queryKey: ["notes", familyId],
    queryFn: () => fetchNotes(familyId!),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 1000 * 60 * 60 * 24,
    placeholderData: keepPreviousData,
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

// ── Notebook Pages ──

export function useNotebookPages(noteId: string | undefined) {
  return useQuery({
    queryKey: ["notebook_pages", noteId],
    queryFn: () => fetchNotebookPages(noteId!),
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateNotebookPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (page: NotebookPageInsert) => createNotebookPage(page),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notebook_pages", variables.note_id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNotebookPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: NotebookPageUpdate & { id: string }) =>
      updateNotebookPage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook_pages"] });
    },
  });
}

export function useDeleteNotebookPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotebookPage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook_pages"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
