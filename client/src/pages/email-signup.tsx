import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Building, ArrowLeft, Eye, EyeOff, ArrowRight, Mail } from "lucide-react";

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userType: z.enum(["talent", "organization"]),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function EmailSignup() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<"talent" | "organization" | null>(null);

  useEffect(() => {
    // Get user type from localStorage
    const pendingUserType = localStorage.getItem('pendingUserType') as "talent" | "organization" | null;
    if (pendingUserType) {
      setUserType(pendingUserType);
    } else {
      // If no user type selected, redirect back to selection
      window.location.href = "/user-type-selection";
    }
  }, []);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      userType: userType || "talent",
    },
  });

  // Update form when userType changes
  useEffect(() => {
    if (userType) {
      form.setValue("userType", userType);
    }
  }, [userType, form]);

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      return await apiRequest("POST", "/api/auth/signup", data);
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully!",
        description: "Welcome to EquityForge.io!",
      });
      // Clear pending user type
      localStorage.removeItem('pendingUserType');
      // Redirect to home dashboard
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  const handleBackToSelection = () => {
    localStorage.removeItem('pendingUserType');
    window.location.href = "/user-type-selection";
  };

  if (!userType) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="absolute left-4 top-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                userType === "talent" ? "bg-blue-100" : "bg-green-100"
              }`}>
                {userType === "talent" ? (
                  <User className="w-8 h-8 text-primary" />
                ) : (
                  <Building className="w-8 h-8 text-green-600" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Create Your {userType === "talent" ? "Professional" : "Organization"} Account
            </CardTitle>
            <CardDescription>
              Join EquityForge.io to {userType === "talent" ? "discover opportunities with equity compensation" : "find and recruit top talent"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input {...field} type="email" placeholder="john@example.com" className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create {userType === "talent" ? "Professional" : "Organization"} Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <a href="/user-type-selection" className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}