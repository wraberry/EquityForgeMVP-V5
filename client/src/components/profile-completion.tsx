import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, User, Building } from "lucide-react";
import type { UserWithProfile } from "@/lib/types";

interface ProfileCompletionProps {
  user: UserWithProfile;
}

export default function ProfileCompletion({ user }: ProfileCompletionProps) {
  const isTalent = user?.userType === "talent";
  const isOrganization = user?.userType === "organization";

  // Fetch profile/organization data
  const { data: profileData } = useQuery({
    queryKey: isTalent ? [`/api/profiles/${user?.id}`] : [`/api/organizations/${user?.id}`],
    enabled: !!user?.id,
    retry: false,
  });

  const completionData = useMemo(() => {
    if (isTalent) {
      const profile = profileData;
      const items = [
        {
          label: "Basic Information",
          completed: !!(user?.firstName && user?.lastName && user?.email),
        },
        {
          label: "Professional Title & Bio",
          completed: !!(profile?.title && profile?.bio),
        },
        {
          label: "Skills & Experience",
          completed: !!(profile?.skills?.length && profile?.experience),
        },
        {
          label: "Location & Availability",
          completed: !!(profile?.location && profile?.availableFor?.length),
        },
        {
          label: "Portfolio Links",
          completed: !!(profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioUrl),
        },
      ];

      const completedCount = items.filter(item => item.completed).length;
      const percentage = Math.round((completedCount / items.length) * 100);

      return { items, percentage, completedCount, totalCount: items.length };
    } else if (isOrganization) {
      const organization = profileData;
      const items = [
        {
          label: "Basic Information",
          completed: !!(user?.firstName && user?.lastName && user?.email),
        },
        {
          label: "Company Details",
          completed: !!(organization?.companyName && organization?.description),
        },
        {
          label: "Industry & Size",
          completed: !!(organization?.industry && organization?.size),
        },
        {
          label: "Location & Website",
          completed: !!(organization?.location && organization?.website),
        },
      ];

      const completedCount = items.filter(item => item.completed).length;
      const percentage = Math.round((completedCount / items.length) * 100);

      return { items, percentage, completedCount, totalCount: items.length };
    }

    return { items: [], percentage: 0, completedCount: 0, totalCount: 0 };
  }, [user, profileData, isTalent, isOrganization]);

  if (completionData.percentage === 100) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Profile Complete!
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Your profile is fully set up and ready to attract opportunities.
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link href="/profile">
              <div className="flex items-center">
                {isTalent ? <User className="w-4 h-4 mr-2" /> : <Building className="w-4 h-4 mr-2" />}
                View Profile
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isTalent ? <User className="w-5 h-5" /> : <Building className="w-5 h-5" />}
          Complete Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="text-primary font-medium">{completionData.percentage}%</span>
          </div>
          <Progress value={completionData.percentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {completionData.completedCount} of {completionData.totalCount} sections completed
          </p>
        </div>

        <ul className="space-y-3 mb-6">
          {completionData.items.map((item, index) => (
            <li key={index} className="flex items-center text-sm">
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span className={item.completed ? "text-green-600" : "text-gray-600"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        <Button asChild className="w-full">
          <Link href="/profile">
            Complete Profile
          </Link>
        </Button>

        {completionData.percentage > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> Complete profiles get {isTalent ? "3x more views" : "better candidate matches"} 
              than incomplete ones.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
