import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "@/services/emergency-contacts";
import type {
  EmergencyContactInsert,
  EmergencyContactUpdate,
} from "@/types/events";

export function useEmergencyContacts(familyId: string | null | undefined) {
  return useQuery({
    queryKey: ["emergency-contacts", familyId],
    queryFn: () => fetchEmergencyContacts(familyId!),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contact: EmergencyContactInsert) =>
      createEmergencyContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
  });
}

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: EmergencyContactUpdate;
    }) => updateEmergencyContact(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmergencyContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
    },
  });
}
