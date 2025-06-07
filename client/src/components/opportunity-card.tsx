import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  MapPin, 
  Building, 
  DollarSign, 
  TrendingUp,
  Briefcase,
  Users,
  Rocket
} from "lucide-react";
import type { OpportunityWithOrganization } from "@/lib/types";

interface OpportunityCardProps {
  opportunity: OpportunityWithOrganization;
  showApplyButton?: boolean;
  onApply?: () => void;
}

export default function OpportunityCard({ 
  opportunity, 
  showApplyButton = false,
  onApply 
}: OpportunityCardProps) {
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "full-time":
        return Briefcase;
      case "part-time":
        return Clock;
      case "contract":
        return Users;
      case "co-founder":
        return Rocket;
      default:
        return Briefcase;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "full-time":
        return "text-blue-600 bg-blue-100";
      case "part-time":
        return "text-green-600 bg-green-100";
      case "contract":
        return "text-purple-600 bg-purple-100";
      case "co-founder":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getEquityBadgeColor = (equityMin?: string) => {
    if (!equityMin) return "bg-gray-100 text-gray-800";
    
    const minValue = parseFloat(equityMin.replace('%', ''));
    if (minValue >= 10) return "bg-blue-100 text-blue-800";
    if (minValue >= 1) return "bg-green-100 text-green-800";
    return "bg-orange-100 text-orange-800";
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
    return null;
  };

  const formatEquity = (min?: string, max?: string) => {
    if (!min && !max) return null;
    if (min && max) return `${min} - ${max} Equity`;
    if (min) return `${min}+ Equity`;
    if (max) return `Up to ${max} Equity`;
    return null;
  };

  const TypeIcon = getTypeIcon(opportunity.type);
  const typeColorClass = getTypeColor(opportunity.type);
  const salary = formatSalary(opportunity.salaryMin, opportunity.salaryMax);
  const equity = formatEquity(opportunity.equityMin, opportunity.equityMax);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${typeColorClass}`}>
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {opportunity.title}
              </h3>
              <div className="flex items-center text-gray-600">
                <Building className="w-4 h-4 mr-1" />
                <span>{opportunity.organization.companyName}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {equity && (
              <Badge className={getEquityBadgeColor(opportunity.equityMin)}>
                {equity}
              </Badge>
            )}
            {salary && (
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {salary}
              </Badge>
            )}
          </div>
        </div>

        {/* Skills and Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="capitalize">
            {opportunity.type.replace('-', ' ')}
          </Badge>
          
          {opportunity.isRemote && (
            <Badge variant="secondary">Remote</Badge>
          )}
          
          {opportunity.location && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {opportunity.location}
            </Badge>
          )}
          
          {opportunity.skills?.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline">
              {skill}
            </Badge>
          ))}
          
          {opportunity.skills && opportunity.skills.length > 3 && (
            <Badge variant="outline">
              +{opportunity.skills.length - 3} more
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {opportunity.description}
        </p>

        {/* Organization Info */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={opportunity.organization.logoUrl || undefined} />
              <AvatarFallback className="text-xs">
                {opportunity.organization.companyName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {opportunity.organization.companyName}
              </p>
              {opportunity.organization.industry && (
                <p className="text-xs text-gray-600">
                  {opportunity.organization.industry}
                </p>
              )}
            </div>
          </div>
          
          {opportunity.organization.size && (
            <Badge variant="outline" className="text-xs">
              {opportunity.organization.size} employees
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Posted {new Date(opportunity.createdAt!).toLocaleDateString()}
          </div>
          
          {showApplyButton && (
            <Button onClick={onApply}>
              Apply Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
