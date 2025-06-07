import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Globe, 
  Users, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  Plus,
  Mail,
  UserPlus,
  Briefcase,
  TrendingUp
} from "lucide-react";

const companyProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.string().min(1, "Company size is required"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  headline: z.string().min(5, "Headline must be at least 5 characters").max(100),
  contactReason: z.string().min(10, "Please provide reasons to contact you").max(200),
});

const talentNeedsSchema = z.object({
  roleTypes: z.array(z.string()).min(1, "Select at least one role type"),
  skills: z.string().min(5, "Please describe required skills").max(300),
  experienceLevel: z.string().min(1, "Experience level is required"),
  workArrangement: z.array(z.string()).min(1, "Select at least one work arrangement"),
  equityRange: z.string().min(1, "Equity range is required"),
  description: z.string().min(10, "Please describe what you're looking for").max(400),
});

const inviteTeamSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  message: z.string().max(200, "Message too long").optional(),
});

type CompanyProfileForm = z.infer<typeof companyProfileSchema>;
type TalentNeedsForm = z.infer<typeof talentNeedsSchema>;
type InviteTeamForm = z.infer<typeof inviteTeamSchema>;

interface CompanyOnboardingProps {
  onComplete: () => void;
}

export default function CompanyOnboarding({ onComplete }: CompanyOnboardingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Company Profile Form
  const profileForm = useForm<CompanyProfileForm>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: "",
      website: "",
      industry: "",
      companySize: "",
      description: "",
      headline: "",
      contactReason: "",
    },
  });

  // Talent Needs Form
  const talentForm = useForm<TalentNeedsForm>({
    resolver: zodResolver(talentNeedsSchema),
    defaultValues: {
      roleTypes: [],
      skills: "",
      experienceLevel: "",
      workArrangement: [],
      equityRange: "",
      description: "",
    },
  });

  // Team Invite Form
  const inviteForm = useForm<InviteTeamForm>({
    resolver: zodResolver(inviteTeamSchema),
    defaultValues: {
      email: "",
      role: "",
      message: "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: CompanyProfileForm) => {
      return await apiRequest("POST", "/api/organizations", data);
    },
    onSuccess: () => {
      toast({
        title: "Company profile created!",
        description: "Your organization profile has been set up successfully.",
      });
      setCompletedSteps(prev => [...prev, 1]);
      setCurrentStep(2);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create company profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveTalentNeedsMutation = useMutation({
    mutationFn: async (data: TalentNeedsForm) => {
      return await apiRequest("POST", "/api/organizations/talent-needs", data);
    },
    onSuccess: () => {
      toast({
        title: "Talent needs saved!",
        description: "Your hiring preferences have been saved.",
      });
      setCompletedSteps(prev => [...prev, 2]);
      setCurrentStep(3);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save talent needs. Please try again.",
        variant: "destructive",
      });
    },
  });

  const inviteTeamMutation = useMutation({
    mutationFn: async (data: InviteTeamForm) => {
      return await apiRequest("POST", "/api/organizations/invite", data);
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent!",
        description: "Team member invitation has been sent successfully.",
      });
      inviteForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const industries = [
    "Technology", "Healthcare", "Finance", "Education", "E-commerce", 
    "Manufacturing", "Consulting", "Media", "Real Estate", "Other"
  ];

  const companySizes = [
    "1-10 employees", "11-50 employees", "51-200 employees", 
    "201-500 employees", "501-1000 employees", "1000+ employees"
  ];

  const roleTypes = [
    "Full-time", "Part-time", "Contract", "Co-founder", "Advisor"
  ];

  const workArrangements = [
    "Remote", "Hybrid", "On-site", "Flexible"
  ];

  const experienceLevels = [
    "Entry level (0-2 years)", "Mid level (3-5 years)", 
    "Senior level (6-10 years)", "Executive level (10+ years)"
  ];

  const equityRanges = [
    "0-0.1%", "0.1-0.5%", "0.5-1%", "1-2%", "2-5%", "5%+"
  ];

  const onProfileSubmit = (data: CompanyProfileForm) => {
    createProfileMutation.mutate(data);
  };

  const onTalentSubmit = (data: TalentNeedsForm) => {
    saveTalentNeedsMutation.mutate(data);
  };

  const onInviteSubmit = (data: InviteTeamForm) => {
    inviteTeamMutation.mutate(data);
  };

  const handleSkipToEnd = () => {
    setCompletedSteps([1, 2, 3]);
    onComplete();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            completedSteps.includes(step) 
              ? "bg-green-500 text-white" 
              : currentStep === step 
                ? "bg-primary text-white" 
                : "bg-gray-200 text-gray-500"
          }`}>
            {completedSteps.includes(step) ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-1 mx-2 ${
              completedSteps.includes(step) ? "bg-green-500" : "bg-gray-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  if (currentStep === 1) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Building2 className="w-6 h-6 mr-2" />
            Create Your Company Profile
          </CardTitle>
          {renderStepIndicator()}
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Acme Inc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={profileForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe your company, mission, and what makes it unique..."
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell talent what your company is about and why they should join you.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Headline *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="CEO & Founder at Acme Inc." />
                    </FormControl>
                    <FormDescription>
                      How should you be introduced to potential candidates?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="contactReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why Should Talent Contact You? *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="I'm looking for exceptional talent to join our mission of..."
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Give candidates compelling reasons to reach out to you.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleSkipToEnd}>
                  Skip Setup
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProfileMutation.isPending}
                  className="flex items-center"
                >
                  {createProfileMutation.isPending ? "Creating..." : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 2) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Target className="w-6 h-6 mr-2" />
            Describe Your Talent Needs
          </CardTitle>
          {renderStepIndicator()}
        </CardHeader>
        <CardContent>
          <Form {...talentForm}>
            <form onSubmit={talentForm.handleSubmit(onTalentSubmit)} className="space-y-6">
              <FormField
                control={talentForm.control}
                name="roleTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Types *</FormLabel>
                    <FormDescription>
                      What types of roles are you looking to fill?
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {roleTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={field.value.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newValue = field.value.includes(type)
                              ? field.value.filter(v => v !== type)
                              : [...field.value, type];
                            field.onChange(newValue);
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={talentForm.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills & Experience *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="React, Node.js, Python, AWS, startup experience..."
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the key skills and experience you're looking for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={talentForm.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={talentForm.control}
                  name="equityRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equity Range *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {equityRanges.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={talentForm.control}
                name="workArrangement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Arrangements *</FormLabel>
                    <FormDescription>
                      How can people work with your company?
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {workArrangements.map((arrangement) => (
                        <Badge
                          key={arrangement}
                          variant={field.value.includes(arrangement) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newValue = field.value.includes(arrangement)
                              ? field.value.filter(v => v !== arrangement)
                              : [...field.value, arrangement];
                            field.onChange(newValue);
                          }}
                        >
                          {arrangement}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={talentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ideal Candidate Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="We're looking for passionate individuals who..."
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe your ideal candidate and what you offer them.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveTalentNeedsMutation.isPending}
                  className="flex items-center"
                >
                  {saveTalentNeedsMutation.isPending ? "Saving..." : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 3) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <UserPlus className="w-6 h-6 mr-2" />
            Invite Your Team
          </CardTitle>
          {renderStepIndicator()}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Build Your Team</h3>
              <p className="text-gray-600 mb-6">
                Invite team members to help manage your company profile and opportunities. 
                They'll get read/write access to your organization.
              </p>
            </div>

            <Form {...inviteForm}>
              <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={inviteForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="colleague@company.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={inviteForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Co-founder, HR Manager, etc." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={inviteForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Hi! I'd like you to join our company profile on EquityForge..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={inviteTeamMutation.isPending}
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {inviteTeamMutation.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </form>
            </Form>

            <Separator />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button onClick={onComplete} className="flex items-center">
                Complete Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}