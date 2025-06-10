import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
  BookmarkPlus, 
  Bookmark,
  MessageCircle,
  DollarSign,
  Clock,
  Award,
  Globe,
  Github,
  Linkedin,
  Users,
  Eye,
  Star
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">The talent profile you're looking for doesn't exist.</p>
        </div>
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
    );
  }

  if (!talent) {
    return (
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
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <Card className="mb-8">
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-t-lg"></div>
        <CardContent className="relative px-6 pb-6">
          <div className="flex items-start justify-between -mt-16">
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={talent.profileImageUrl} />
                <AvatarFallback className="text-2xl">
                  {talent.firstName[0]}{talent.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="mt-16">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {talent.firstName} {talent.lastName}
                  </h1>
                  <Badge className={getWorkStatusColor(talent.profile.workStatus)}>
                    {getWorkStatusText(talent.profile.workStatus)}
                  </Badge>
                </div>
                <p className="text-lg text-gray-600 mb-2">{talent.profile.title}</p>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {talent.profile.location}
                  {talent.profile.timezone && (
                    <>
                      <Clock className="w-4 h-4 ml-4 mr-1" />
                      {talent.profile.timezone}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={handleSaveTalent}
                className="flex items-center gap-2"
                disabled={saveTalentMutation.isPending}
              >
                {talent.isSaved ? <Bookmark className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                {talent.isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button
                onClick={handleContact}
                className="flex items-center gap-2"
                disabled={contactMutation.isPending}
              >
                <MessageCircle className="w-4 h-4" />
                Contact
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Looking for Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Looking for new opportunities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-gray-600">Roles interested in:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {talent.profile.availableFor.map((type) => (
                      <Badge key={type} variant="outline">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-600">Seniority:</p>
                  <p className="mt-1">{talent.profile.experienceLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{talent.profile.bio}</p>
            </CardContent>
          </Card>

          {/* Experience Section */}
          {talent.profile.experience && (
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{talent.profile.experience}</p>
              </CardContent>
            </Card>
          )}

          {/* Education Section */}
          {talent.profile.education && talent.profile.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {talent.profile.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold">{edu.institution}</h4>
                    <p className="text-gray-600">{edu.degree} in {edu.field}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </div>
                ))}
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
                        <p className="text-gray-700 text-sm italic">"{rec.text}"</p>
                      </div>
                    </div>
                    {index < talent.profile.recommendations.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{talent.email}</span>
              </div>
              {talent.profile.linkedinUrl && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-gray-500" />
                  <a 
                    href={talent.profile.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {talent.profile.githubUrl && (
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-gray-500" />
                  <a 
                    href={talent.profile.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    GitHub Profile
                  </a>
                </div>
              )}
              {talent.profile.portfolioUrl && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <a 
                    href={talent.profile.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Portfolio
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                {talent.profile.profileViews || 0} profile views
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {talent.profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Currently:</p>
                <Badge className={getWorkStatusColor(talent.profile.workStatus)}>
                  {getWorkStatusText(talent.profile.workStatus)}
                </Badge>
              </div>
              {talent.profile.salaryExpectation && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{talent.profile.salaryExpectation}</span>
                </div>
              )}
              {talent.profile.hourlyRate && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{talent.profile.hourlyRate}/hour</span>
                </div>
              )}
              {talent.profile.equityInterest && (
                <Badge variant="outline">
                  Interested in Equity
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          {talent.profile.certifications && talent.profile.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {talent.profile.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {talent.profile.languages && talent.profile.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {talent.profile.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{lang.language}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lang.proficiency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}