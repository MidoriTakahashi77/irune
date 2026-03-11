import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMemberDetails,
  upsertMemberDetails,
} from "@/services/member-details";
import type { MemberDetailInsert } from "@/types/events";

export function useMemberDetails(profileId: string | undefined) {
  return useQuery({
    queryKey: ["member-details", profileId],
    queryFn: () => fetchMemberDetails(profileId!),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useUpsertMemberDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      profileId,
      details,
    }: {
      profileId: string;
      details: Omit<MemberDetailInsert, "profile_id">;
    }) => upsertMemberDetails(profileId, details),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["member-details", variables.profileId],
      });
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
    },
  });
}
