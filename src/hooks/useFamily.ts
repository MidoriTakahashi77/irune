import { useQuery } from "@tanstack/react-query";
import { fetchFamilyMembers } from "@/services/families";

export function useFamily(familyId: string | null | undefined) {
  return useQuery({
    queryKey: ["family-members", familyId],
    queryFn: () => fetchFamilyMembers(familyId!),
    enabled: !!familyId,
    staleTime: 10 * 60 * 1000, // 10分間はrefetchしない
    gcTime: 60 * 60 * 1000,    // 1時間キャッシュ保持
  });
}
