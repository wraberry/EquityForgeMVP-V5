import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Mail, 
  Calendar, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  MessageCircle,
  Eye,
  Star,
  Globe,
  Github,
  Linkedin,
  Users
} from "lucide-react";

interface TalentProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  profile: {
    title: string;
    bio: string;
    skills: string[];
    experience: string;
    location: string;
    experienceLevel: string;
    workStatus: string;
    salaryExpectation: string;
    hourlyRate?: string;
    availableFor: string[];
    equityInterest: boolean;
    profileViews: number;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    timezone?: string;
    languages?: Array<{ language: string; proficiency: string }>;
    certifications?: string[];
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      year: string;
    }>;
    recommendations?: Array<{
      name: string;
      title: string;
      company: string;
      text: string;
    }>;
  };
  isSaved?: boolean;
}

export default function TalentProfile() {
  const [match, params] = useRoute("/talent/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const talentId = params?.id;

  if (!talentId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">The talent profile you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Fetch talent profile
  const { data: talent, isLoading } = useQuery<TalentProfileData>({
    queryKey: ["/api/talent", talentId],
    enabled: !!talentId && !!user,
  });

  // Save/unsave talent mutation
  const saveTalentMutation = useMutation({
    mutationFn: async ({ action }: { action: 'save' | 'unsave' }) => {
      return await apiRequest(action === 'save' ? 'POST' : 'DELETE', '/api/saved-talent', { talentUserId: talentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/talent", talentId] });
      toast({
        title: "Success",
        description: "Talent profile updated in your saved list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update saved talent.",
        variant: "destructive",
      });
    },
  });

  // Contact talent mutation
  const contactMutation = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      return await apiRequest('POST', '/api/messages', {
        toUserId: talentId,
        content: message
      });
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const handleSaveTalent = () => {
    saveTalentMutation.mutate({
      action: talent?.isSaved ? 'unsave' : 'save'
    });
  };

  const handleContact = () => {
    // For now, just send a basic introduction message
    const message = `Hi ${talent?.firstName}, I'm interested in discussing potential opportunities. Would you be available for a conversation?`;
    contactMutation.mutate({ message });
  };

  const getWorkStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'not-looking': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getWorkStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open to Work';
      case 'interviewing': return 'Interviewing';
      case 'not-looking': return 'Not Looking';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-48 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-300 h-32 rounded-lg"></div>
                <div className="bg-gray-300 h-48 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-300 h-40 rounded-lg"></div>
                <div className="bg-gray-300 h-32 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile not found</h3>
              <p className="text-gray-600">
                The talent profile you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={talent.profileImageUrl} />
                <AvatarFallback className="text-xl">
                  {talent.firstName[0]}{talent.lastName[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {talent.firstName} {talent.lastName}
                    </h1>
                    <p className="text-xl text-gray-600 mt-1">{talent.profile.title}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {talent.profile.location}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Eye className="w-4 h-4 mr-1" />
                        {talent.profile.profileViews} views
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleContact} disabled={contactMutation.isPending}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {contactMutation.isPending ? 'Sending...' : 'Message'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleSaveTalent}
                      disabled={saveTalentMutation.isPending}
                    >
                      {talent.isSaved ? (
                        <BookmarkCheck className="w-4 h-4 mr-2" />
                      ) : (
                        <Bookmark className="w-4 h-4 mr-2" />
                      )}
                      {saveTalentMutation.isPending ? 'Saving...' : (talent.isSaved ? 'Saved' : 'Save')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{talent.profile.bio}</p>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talent.profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Experience Section */}
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{talent.profile.experience}</p>
              </CardContent>
            </Card>

            {/* Education Section */}
            {talent.profile.education && talent.profile.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {talent.profile.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h4>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">Class of {edu.year}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Certifications Section */}
            {talent.profile.certifications && talent.profile.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {talent.profile.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-2" />
                        <span className="text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages Section */}
            {talent.profile.languages && talent.profile.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {talent.profile.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{lang.language}</span>
                        <Badge variant="outline">{lang.proficiency}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations Section */}
            {talent.profile.recommendations && talent.profile.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {talent.profile.recommendations.map((rec, index) => (
                    <div key={index}>
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{rec.name?.[0] || 'R'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{rec.name}</p>
                            <p className="text-sm text-gray-600">{rec.title} at {rec.company}</p>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{rec.text}</p>
                        </div>
                      </div>
                      {index < talent.profile.recommendations.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Work Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getWorkStatusColor(talent.profile.workStatus)}>
                  {getWorkStatusText(talent.profile.workStatus)}
                </Badge>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Experience Level</p>
                    <p className="text-sm text-gray-600 capitalize">{talent.profile.experienceLevel}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Salary Expectation</p>
                    <p className="text-sm text-gray-600">{talent.profile.salaryExpectation}</p>
                  </div>

                  {talent.profile.hourlyRate && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Hourly Rate</p>
                      <p className="text-sm text-gray-600">{talent.profile.hourlyRate}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-900">Equity Interest</p>
                    <p className="text-sm text-gray-600">
                      {talent.profile.equityInterest ? 'Yes' : 'No'}
                    </p>
                  </div>

                  {talent.profile.timezone && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Timezone</p>
                      <p className="text-sm text-gray-600">{talent.profile.timezone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available For */}
            <Card>
              <CardHeader>
                <CardTitle>Available For</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {talent.profile.availableFor.map((type, index) => (
                    <Badge key={index} variant="outline" className="block text-center">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">{talent.email}</span>
                </div>

                {talent.profile.linkedinUrl && (
                  <a 
                    href={talent.profile.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    <span className="text-sm">LinkedIn Profile</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}

                {talent.profile.githubUrl && (
                  <a 
                    href={talent.profile.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    <span className="text-sm">GitHub Profile</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}

                {talent.profile.portfolioUrl && (
                  <a 
                    href={talent.profile.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="text-sm">Portfolio</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}