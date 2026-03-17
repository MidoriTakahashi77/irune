import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTrustedContacts,
  createTrustedContact,
  updateTrustedContact,
  deleteTrustedContact,
  sendSosEmails,
} from "@/services/trusted-contacts";
import type { TrustedContactInsert, TrustedContactUpdate } from "@/types/events";

const KEY = "trusted-contacts";

export function useTrustedContacts(familyId: string | null | undefined) {
  return useQuery({
    queryKey: [KEY, familyId],
    queryFn: () => fetchTrustedContacts(familyId!),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateTrustedContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contact: TrustedContactInsert) => createTrustedContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useUpdateTrustedContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TrustedContactUpdate }) =>
      updateTrustedContact(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useDeleteTrustedContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTrustedContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
    },
  });
}

export function useSendSos() {
  return useMutation({
    mutationFn: ({ familyId, senderName }: { familyId: string; senderName: string }) =>
      sendSosEmails(familyId, senderName),
  });
}
