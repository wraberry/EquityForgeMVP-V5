import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Filter, 
  BookmarkPlus, 
  Mail, 
  Star, 
  Eye,
  Bookmark
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface TalentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  profile: {
    title: string;
    bio: string;
    skills: string[];
    location: string;
    experienceLevel: string;
    workStatus: string;
    salaryExpectation: string;
    availableFor: string[];
    equityInterest: boolean;
    profileViews: number;
  };
  isSaved?: boolean;
}

interface FilterState {
  search: string;
  experienceLevel: string;
  workStatus: string;
  location: string;
  skills: string;
  availableFor: string;
  equityInterest: string;
}

export default function FindTalent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    experienceLevel: "",
    workStatus: "",
    location: "",
    skills: "",
    availableFor: "",
    equityInterest: ""
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce filter changes to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Fetch talent profiles - always enabled for organization users
  const { data: talentsData, isLoading, error } = useQuery<TalentProfile[]>({
    queryKey: ["/api/talent", debouncedFilters],
    enabled: !!user, // Allow access regardless of organization setup
    retry: 2,
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add filters to query params, handling "any" values
      Object.entries(debouncedFilters).forEach(([key, value]) => {
        if (value && value !== "any" && value !== "") {
          params.append(key, value);
        }
      });
      
      const response = await fetch(`/api/talent?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch talent profiles');
      }
      return response.json();
    },
  });

  // Ensure talents is always an array
  const talents = Array.isArray(talentsData) ? talentsData : [];

  // Save/unsave talent mutation
  const saveTalentMutation = useMutation({
    mutationFn: async ({ talentUserId, action }: { talentUserId: string; action: 'save' | 'unsave' }) => {
      return await apiRequest(action === 'save' ? 'POST' : 'DELETE', '/api/saved-talent', { talentUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/talent"] });
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

  const handleSaveTalent = (talentUserId: string, isSaved: boolean) => {
    saveTalentMutation.mutate({
      talentUserId,
      action: isSaved ? 'unsave' : 'save'
    });
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      experienceLevel: "any",
      workStatus: "any",
      location: "",
      skills: "",
      availableFor: "any",
      equityInterest: "any"
    });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load talent profiles</h3>
              <p className="text-gray-600 mb-4">
                There was an error loading the talent directory. Please try again later.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">People Directory</h1>
          <p className="text-gray-600">Connect with professionals, founders, and investors in the equity network</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, title, skills, or location..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Experience Level</label>
                    <Select value={filters.experienceLevel} onValueChange={(value) => handleFilterChange('experienceLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any level</SelectItem>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Work Status</label>
                    <Select value={filters.workStatus} onValueChange={(value) => handleFilterChange('workStatus', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any status</SelectItem>
                        <SelectItem value="open">Open to Work</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="not-looking">Not Looking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Available For</label>
                    <Select value={filters.availableFor} onValueChange={(value) => handleFilterChange('availableFor', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any type</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="co-founder">Co-founder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Equity Interest</label>
                    <Select value={filters.equityInterest} onValueChange={(value) => handleFilterChange('equityInterest', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any preference</SelectItem>
                        <SelectItem value="true">Interested in Equity</SelectItem>
                        <SelectItem value="false">Not Interested</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={clearFilters} size="sm">
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.map((talent: TalentProfile) => (
            <Card key={talent.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={talent.profileImageUrl} />
                      <AvatarFallback>
                        {talent.firstName[0]}{talent.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {talent.firstName} {talent.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{talent.profile.title}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveTalent(talent.id, !!talent.isSaved)}
                    disabled={saveTalentMutation.isPending}
                  >
                    {talent.isSaved ? (
                      <Bookmark className="w-4 h-4 text-blue-600 fill-current" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {talent.profile.location}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getWorkStatusColor(talent.profile.workStatus)}>
                      {getWorkStatusText(talent.profile.workStatus)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {talent.profile.experienceLevel}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2">
                    {talent.profile.bio}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {talent.profile.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {talent.profile.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{talent.profile.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="w-3 h-3 mr-1" />
                    {talent.profile.profileViews} views
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/talent/${talent.id}`}>
                        View Profile
                      </Link>
                    </Button>
                    <Button size="sm">
                      <Mail className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {talents.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No talent found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters to find more professionals.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}