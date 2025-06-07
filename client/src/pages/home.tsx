import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Send, MessageCircle, Users, Briefcase, TrendingUp, Building2, CheckCircle } from "lucide-react";
import OpportunityCard from "@/components/opportunity-card";
import ApplicationCard from "@/components/application-card";
import ProfileCompletion from "@/components/profile-completion";
import CompanyOnboarding from "@/components/company-onboarding";
import type { OpportunityWithOrganization, ApplicationWithOpportunity } from "@/lib/types";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showCompanyOnboarding, setShowCompanyOnboarding] = useState(false);

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

  const { data: opportunities = [], isLoading: opportunitiesLoading } = useQuery<OpportunityWithOrganization[]>({
    queryKey: ["/api/opportunities"],
    enabled: isAuthenticated,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<ApplicationWithOpportunity[]>({
    queryKey: ["/api/applications"],
    enabled: isAuthenticated && user?.userType === "talent",
  });

  const { data: myOpportunities = [], isLoading: myOpportunitiesLoading } = useQuery({
    queryKey: ["/api/my-opportunities"],
    enabled: isAuthenticated && user?.userType === "organization",
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const isTalent = user?.userType === "talent";
  const isOrganization = user?.userType === "organization";
  const needsCompanyProfile = isOrganization && !user?.additionalData;

  // Show company onboarding for organizations without profile
  useEffect(() => {
    if (needsCompanyProfile) {
      setShowCompanyOnboarding(true);
    }
  }, [needsCompanyProfile]);

  // Show company onboarding flow
  if (showCompanyOnboarding && needsCompanyProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <Header />
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to EquityForge.io!
            </h1>
            <p className="text-lg text-gray-600">
              Let's set up your company profile to start connecting with talent
            </p>
          </div>
          <CompanyOnboarding onComplete={() => setShowCompanyOnboarding(false)} />
        </div>
      </div>
    );
  }

  // Mock stats for demonstration
  const talentStats = {
    profileViews: 247,
    applications: applications.length,
    messages: 8,
  };

  const organizationStats = {
    totalOpportunities: myOpportunities.length,
    totalApplications: 45,
    activePostings: myOpportunities.filter((op: any) => op.status === "active").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">
            {isTalent 
              ? "Discover new opportunities and manage your applications"
              : "Manage your job postings and find talented candidates"
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {isTalent && (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Eye className="text-primary w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Profile Views</p>
                          <p className="text-2xl font-bold text-gray-900">{talentStats.profileViews}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Send className="text-green-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Applications</p>
                          <p className="text-2xl font-bold text-gray-900">{talentStats.applications}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MessageCircle className="text-purple-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Messages</p>
                          <p className="text-2xl font-bold text-gray-900">{talentStats.messages}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {isOrganization && (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="text-primary w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Active Postings</p>
                          <p className="text-2xl font-bold text-gray-900">{organizationStats.activePostings}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="text-green-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Total Applications</p>
                          <p className="text-2xl font-bold text-gray-900">{organizationStats.totalApplications}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="text-purple-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Total Opportunities</p>
                          <p className="text-2xl font-bold text-gray-900">{organizationStats.totalOpportunities}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Recent Applications or Latest Opportunities */}
            {isTalent && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {applicationsLoading ? (
                    <div>Loading applications...</div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No applications yet</p>
                      <Button asChild>
                        <a href="/opportunities">Browse Opportunities</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.slice(0, 3).map((application) => (
                        <ApplicationCard key={application.id} application={application} />
                      ))}
                      {applications.length > 3 && (
                        <Button variant="ghost" className="w-full">
                          View All Applications
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isOrganization && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Recent Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  {myOpportunitiesLoading ? (
                    <div>Loading opportunities...</div>
                  ) : myOpportunities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No opportunities posted yet</p>
                      <Button asChild>
                        <a href="/post-opportunity">Post Your First Opportunity</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myOpportunities.slice(0, 3).map((opportunity: any) => (
                        <div key={opportunity.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{opportunity.title}</h4>
                            <Badge variant={opportunity.status === "active" ? "default" : "secondary"}>
                              {opportunity.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{opportunity.type}</p>
                          <p className="text-xs text-gray-500">
                            Posted {new Date(opportunity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full">
                        View All Opportunities
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Latest Opportunities for All Users */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                {opportunitiesLoading ? (
                  <div>Loading opportunities...</div>
                ) : (
                  <div className="space-y-4">
                    {opportunities.slice(0, 3).map((opportunity) => (
                      <OpportunityCard key={opportunity.id} opportunity={opportunity} showApplyButton={isTalent} />
                    ))}
                    <Button variant="ghost" className="w-full" asChild>
                      <a href="/opportunities">View All Opportunities</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Completion */}
            <ProfileCompletion user={user} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isTalent && (
                  <>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href="/opportunities">
                        <Briefcase className="text-primary mr-3 w-4 h-4" />
                        Browse Jobs
                      </a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href="/profile">
                        <Users className="text-primary mr-3 w-4 h-4" />
                        Edit Profile
                      </a>
                    </Button>
                  </>
                )}
                {isOrganization && (
                  <>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href="/post-opportunity">
                        <Briefcase className="text-primary mr-3 w-4 h-4" />
                        Post Opportunity
                      </a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href="/profile">
                        <Users className="text-primary mr-3 w-4 h-4" />
                        Edit Organization
                      </a>
                    </Button>
                  </>
                )}
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/messages">
                    <MessageCircle className="text-primary mr-3 w-4 h-4" />
                    Messages
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
