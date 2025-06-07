import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Briefcase, Building, DollarSign } from "lucide-react";
import OpportunityCard from "@/components/opportunity-card";
import type { OpportunityWithOrganization } from "@/lib/types";

export default function Opportunities() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  
  // Application modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithOrganization | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);

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

  // Filter opportunities based on search criteria
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.organization.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "all" || opportunity.type === typeFilter;
    
    const matchesLocation = !locationFilter || 
                          opportunity.location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
                          opportunity.isRemote;

    return matchesSearch && matchesType && matchesLocation;
  });

  // Application mutation
  const applyMutation = useMutation({
    mutationFn: async ({ opportunityId, coverLetter }: { opportunityId: number; coverLetter: string }) => {
      return await apiRequest("POST", "/api/applications", { opportunityId, coverLetter });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });
      setApplicationModalOpen(false);
      setCoverLetter("");
      setSelectedOpportunity(null);
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
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
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApply = (opportunity: OpportunityWithOrganization) => {
    setSelectedOpportunity(opportunity);
    setApplicationModalOpen(true);
  };

  const submitApplication = () => {
    if (selectedOpportunity) {
      applyMutation.mutate({
        opportunityId: selectedOpportunity.id,
        coverLetter,
      });
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const isTalent = user?.userType === "talent";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Opportunities</h1>
          <p className="text-gray-600">
            Discover exciting roles with equity compensation
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Briefcase className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="co-founder">Co-founder</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setLocationFilter("");
              }} variant="outline">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            {filteredOpportunities.length} opportunities found
          </p>
          {!isTalent && (
            <Button asChild>
              <a href="/post-opportunity">Post New Opportunity</a>
            </Button>
          )}
        </div>

        {/* Opportunities List */}
        {opportunitiesLoading ? (
          <div className="text-center py-8">Loading opportunities...</div>
        ) : filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-600 mb-4">
                {opportunities.length === 0 
                  ? "No opportunities have been posted yet."
                  : "Try adjusting your search criteria."}
              </p>
              {!isTalent && (
                <Button asChild>
                  <a href="/post-opportunity">Post the first opportunity</a>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                showApplyButton={isTalent}
                onApply={() => handleApply(opportunity)}
              />
            ))}
          </div>
        )}

        {/* Application Modal */}
        <Dialog open={applicationModalOpen} onOpenChange={setApplicationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply to {selectedOpportunity?.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">{selectedOpportunity?.title}</h4>
                <p className="text-sm text-gray-600">{selectedOpportunity?.organization.companyName}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{selectedOpportunity?.type}</Badge>
                  {selectedOpportunity?.equityMin && (
                    <Badge variant="secondary">
                      {selectedOpportunity.equityMin}
                      {selectedOpportunity.equityMax && ` - ${selectedOpportunity.equityMax}`} Equity
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell them why you're interested in this opportunity and what you can bring to the role..."
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setApplicationModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitApplication}
                  disabled={applyMutation.isPending || !coverLetter.trim()}
                >
                  {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
