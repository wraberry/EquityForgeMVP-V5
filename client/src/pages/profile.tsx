import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Profile, Organization } from "@shared/schema";

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const isTalent = user?.userType === "talent";
  const isOrganization = user?.userType === "organization";

  // State for form data
  const [formData, setFormData] = useState<any>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [availableFor, setAvailableFor] = useState<string[]>([]);

  // Fetch existing profile/organization data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: isTalent ? [`/api/profiles/${user?.id}`] : [`/api/organizations/${user?.id}`],
    enabled: isAuthenticated && !!user?.id,
    retry: false,
  });

  // Initialize form data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData(profileData);
      if (isTalent && profileData.skills) {
        setSkills(profileData.skills);
      }
      if (isTalent && profileData.availableFor) {
        setAvailableFor(profileData.availableFor);
      }
    }
  }, [profileData, isTalent]);

  // Mutation for saving profile
  const saveProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isTalent ? "/api/profiles" : "/api/organizations";
      return await apiRequest("POST", endpoint, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ 
        queryKey: isTalent ? [`/api/profiles/${user?.id}`] : [`/api/organizations/${user?.id}`] 
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData,
      ...(isTalent && { skills, availableFor }),
    };

    saveProfileMutation.mutate(dataToSave);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const toggleAvailableFor = (type: string) => {
    setAvailableFor(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isTalent ? "Your Profile" : "Organization Profile"}
          </h1>
          <p className="text-gray-600">
            {isTalent 
              ? "Complete your profile to attract the right opportunities"
              : "Complete your organization profile to attract top talent"
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isTalent ? "Personal Information" : "Organization Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {isTalent ? (
                // Talent Profile Form
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Professional Title</Label>
                      <Input
                        id="title"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location || ""}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio || ""}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself, your experience, and what you're looking for..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Skills</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Textarea
                      id="experience"
                      value={formData.experience || ""}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      placeholder="Describe your relevant work experience..."
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                      <Input
                        id="linkedinUrl"
                        value={formData.linkedinUrl || ""}
                        onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="githubUrl">GitHub URL</Label>
                      <Input
                        id="githubUrl"
                        value={formData.githubUrl || ""}
                        onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                      <Input
                        id="portfolioUrl"
                        value={formData.portfolioUrl || ""}
                        onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="salaryExpectation">Salary Expectation</Label>
                    <Input
                      id="salaryExpectation"
                      value={formData.salaryExpectation || ""}
                      onChange={(e) => setFormData({...formData, salaryExpectation: e.target.value})}
                      placeholder="e.g., $120k - $150k"
                    />
                  </div>

                  <div>
                    <Label>Available For</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[
                        { value: "full-time", label: "Full-time" },
                        { value: "part-time", label: "Part-time" },
                        { value: "contract", label: "Contract" },
                        { value: "co-founder", label: "Co-founder" },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.value}
                            checked={availableFor.includes(option.value)}
                            onCheckedChange={() => toggleAvailableFor(option.value)}
                          />
                          <Label htmlFor={option.value}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="equityInterest"
                      checked={formData.equityInterest !== false}
                      onCheckedChange={(checked) => setFormData({...formData, equityInterest: checked})}
                    />
                    <Label htmlFor="equityInterest">Interested in equity compensation</Label>
                  </div>
                </>
              ) : (
                // Organization Profile Form
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName || ""}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        placeholder="Your Company Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website || ""}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe your company, mission, and what you do..."
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry || ""}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                        placeholder="e.g., Technology, Healthcare"
                      />
                    </div>
                    <div>
                      <Label htmlFor="size">Company Size</Label>
                      <Select
                        value={formData.size || ""}
                        onValueChange={(value) => setFormData({...formData, size: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="foundedYear">Founded Year</Label>
                      <Input
                        id="foundedYear"
                        type="number"
                        value={formData.foundedYear || ""}
                        onChange={(e) => setFormData({...formData, foundedYear: parseInt(e.target.value)})}
                        placeholder="2020"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saveProfileMutation.isPending}
                  className="px-8"
                >
                  {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
