import { useQuery } from "@tanstack/react-query";
import type { UserWithProfile } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<UserWithProfile>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/auth/user");
      } catch (error: any) {
        if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
