import { useQuery } from "@tanstack/react-query";
import { fetchFamilyMembers } from "@/services/families";

export function useFamily(familyId: string | null | undefined) {
  return useQuery({
    queryKey: ["family-members", familyId],
    queryFn: () => fetchFamilyMembers(familyId!),
    enabled: !!familyId,
  });
}
