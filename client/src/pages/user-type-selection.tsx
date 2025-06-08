import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Building, CheckCircle, ArrowRight, Briefcase, Users, TrendingUp, Handshake } from "lucide-react";

export default function UserTypeSelection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<"talent" | "organization" | null>(() => {
    // Check for pending user type from localStorage
    const pending = localStorage.getItem('pendingUserType');
    return pending as "talent" | "organization" | null;
  });

  const updateUserTypeMutation = useMutation({
    mutationFn: async (userType: "talent" | "organization") => {
      return await apiRequest("POST", "/api/auth/user-type", { userType });
    },
    onSuccess: () => {
      localStorage.removeItem('pendingUserType');
      toast({
        title: "Account setup complete!",
        description: "Welcome to EquityForge.io",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Use a small delay to ensure the user data is updated before redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Setup failed",
        description: error.message || "Failed to complete account setup.",
        variant: "destructive",
      });
    },
  });

  // Auto-select pending type on component mount only
  useEffect(() => {
    const pendingType = localStorage.getItem('pendingUserType');
    if (pendingType && !selectedType) {
      setSelectedType(pendingType as "talent" | "organization");
    }
  }, []); // Only run once on mount
  
  // Check if user already has a type and show proper UI
  const userWithType = user as any;
  const hasUserType = userWithType?.userType;
  
  if (isAuthenticated && user && hasUserType) {
    // User already has a type, show completion message and redirect
    setTimeout(() => window.location.href = "/", 1000);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome back!</h2>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContinue = () => {
    if (selectedType) {
      if (isAuthenticated) {
        updateUserTypeMutation.mutate(selectedType);
      } else {
        // Store selection and redirect to auth
        localStorage.setItem('pendingUserType', selectedType);
        window.location.href = "/api/login";
      }
    }
  };

  const handleReplitSignIn = () => {
    if (selectedType) {
      localStorage.setItem('pendingUserType', selectedType);
    }
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to EquityForge.io
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Talent Option */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
              selectedType === "talent" 
                ? "ring-4 ring-white shadow-2xl scale-105" 
                : "hover:scale-102"
            }`}
            onClick={() => setSelectedType("talent")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">I'm a Professional</CardTitle>
              <p className="text-gray-600">Looking for opportunities with equity compensation</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-700">
                  <Briefcase className="w-4 h-4 mr-3 text-primary" />
                  <span>Find full-time, part-time, contract, and co-founder roles</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 mr-3 text-primary" />
                  <span>Access equity compensation opportunities</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="w-4 h-4 mr-3 text-primary" />
                  <span>Connect with innovative startups and companies</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Handshake className="w-4 h-4 mr-3 text-primary" />
                  <span>Build your professional network</span>
                </div>
              </div>

              {selectedType === "talent" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-800">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Great choice!</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    You'll be able to browse opportunities, apply to roles, and connect with companies offering equity compensation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organization Option */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
              selectedType === "organization" 
                ? "ring-4 ring-white shadow-2xl scale-105" 
                : "hover:scale-102"
            }`}
            onClick={() => setSelectedType("organization")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">I'm Hiring Talent</CardTitle>
              <p className="text-gray-600">Looking to find and recruit top professionals</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="w-4 h-4 mr-3 text-green-600" />
                  <span>Post job opportunities with equity compensation</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Briefcase className="w-4 h-4 mr-3 text-green-600" />
                  <span>Find candidates for all role types</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 mr-3 text-green-600" />
                  <span>Access a curated talent pool</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Handshake className="w-4 h-4 mr-3 text-green-600" />
                  <span>Connect with top professionals and co-founders</span>
                </div>
              </div>

              {selectedType === "organization" && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Perfect!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    You'll be able to post opportunities, review applications, and find the perfect candidates for your team.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {!isAuthenticated && selectedType ? (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-center mb-4">
              Sign in to continue as {selectedType === "talent" ? "Professional" : "Organization"}
            </h3>

            <div className="space-y-3">
              <Button
                type="button"
                className="w-full"
                onClick={handleReplitSignIn}
              >
                <User className="w-5 h-5 mr-2" />
                Sign up / Sign in with Replit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600 mt-4">
              Using Replit's secure authentication system
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Button 
              size="lg"
              onClick={handleContinue}
              disabled={!selectedType || updateUserTypeMutation.isPending}
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg shadow-lg"
            >
              {updateUserTypeMutation.isPending ? (
                "Setting up your account..."
              ) : (
                <>
                  Continue as {selectedType === "talent" ? "Professional" : "Organization"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {!selectedType && (
              <p className="text-blue-100 text-sm mt-4">
                Please select an account type to continue
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}