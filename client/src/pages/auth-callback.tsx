import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AuthCallback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  const updateUserTypeMutation = useMutation({
    mutationFn: async (userType: "talent" | "organization") => {
      return await apiRequest("POST", "/api/auth/user-type", { userType });
    },
    onSuccess: () => {
      toast({
        title: "Account setup complete!",
        description: "Welcome to EquityForge.io!",
      });
      localStorage.removeItem('pendingUserType');
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Failed to set user type:", error);
      localStorage.removeItem('pendingUserType');
      window.location.href = "/user-type-selection";
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const pendingUserType = localStorage.getItem('pendingUserType') as "talent" | "organization" | null;
      
      if (pendingUserType && !user.userType) {
        // User just completed OAuth and has a pending user type
        updateUserTypeMutation.mutate(pendingUserType);
      } else if (!user.userType) {
        // User is authenticated but no user type - redirect to selection
        window.location.href = "/user-type-selection";
      } else {
        // User is fully set up - go to home
        localStorage.removeItem('pendingUserType');
        window.location.href = "/";
      }
    } else if (!isLoading && !isAuthenticated) {
      // Not authenticated - redirect to user type selection
      window.location.href = "/user-type-selection";
    }
  }, [isLoading, isAuthenticated, user, updateUserTypeMutation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your account...</h2>
        <p className="text-gray-600">Please wait while we complete your registration.</p>
      </div>
    </div>
  );
}