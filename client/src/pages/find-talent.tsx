import { useState } from "react";
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

  // Fetch talent profiles
  const { data: talents = [], isLoading } = useQuery<TalentProfile[]>({
    queryKey: ["/api/talent", filters],
    enabled: !!user,
  });

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
      experienceLevel: "",
      workStatus: "",
      location: "",
      skills: "",
      availableFor: "",
      equityInterest: ""
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">People Directory</h1>
        <p className="text-gray-600">Connect with professionals, founders, and investors in the equity network</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, title, skills..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {['Open to Work', 'Available Now', 'Senior Experience', 'Remote'].map((pill) => (
            <Badge
              key={pill}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              {pill}
            </Badge>
          ))}
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <Select value={filters.experienceLevel} onValueChange={(value) => handleFilterChange('experienceLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any level</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Work Status</label>
                <Select value={filters.workStatus} onValueChange={(value) => handleFilterChange('workStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any status</SelectItem>
                    <SelectItem value="open">Open to Work</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="not-looking">Not Looking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  placeholder="City or Remote"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <Select value={filters.availableFor} onValueChange={(value) => handleFilterChange('availableFor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="co-founder">Co-founder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              <div className="text-sm text-gray-600">
                {talents.length} professionals found
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {talents.map((talent: TalentProfile) => (
          <Card key={talent.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={talent.profileImageUrl} />
                    <AvatarFallback>
                      {talent.firstName[0]}{talent.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {talent.firstName} {talent.lastName}
                      </h3>
                      {talent.profile.workStatus === 'open' && (
                        <Badge className={getWorkStatusColor(talent.profile.workStatus)}>
                          {getWorkStatusText(talent.profile.workStatus)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{talent.profile.title}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveTalent(talent.id, talent.isSaved || false)}
                  className={talent.isSaved ? "text-primary" : "text-gray-400"}
                >
                  {talent.isSaved ? <Bookmark className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                </Button>
              </div>

              {/* Company & Location */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mr-1" />
                {talent.profile.location}
              </div>

              {/* Bio */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                {talent.profile.bio}
              </p>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {talent.profile.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {talent.profile.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{talent.profile.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {talent.profile.profileViews || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {talent.profile.experienceLevel}
                  </div>
                </div>
                {talent.profile.equityInterest && (
                  <Badge variant="outline" className="text-xs">
                    Equity Interest
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/talent/${talent.id}`}>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Profile
                  </Button>
                </Link>
                <Button size="sm" className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {talents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
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
  );
}