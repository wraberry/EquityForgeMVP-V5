import { useQuery } from "@tanstack/react-query";
import type { UserWithProfile } from "@/lib/types";

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserWithProfile>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
