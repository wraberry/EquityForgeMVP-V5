import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Clock, DollarSign } from "lucide-react";
import type { ApplicationWithOpportunity } from "@/lib/types";

interface ApplicationCardProps {
  application: ApplicationWithOpportunity;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewing":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Under Review";
      case "reviewing":
        return "In Review";
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Not Selected";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
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
    if (min && max) return `${min} - ${max}`;
    if (min) return `${min}+`;
    if (max) return `Up to ${max}`;
    return null;
  };

  const salary = formatSalary(application.opportunity.salaryMin, application.opportunity.salaryMax);
  const equity = formatEquity(application.opportunity.equityMin, application.opportunity.equityMax);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={application.opportunity.organization.logoUrl || undefined} />
              <AvatarFallback className="text-xs">
                {application.opportunity.organization.companyName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {application.opportunity.title}
              </h4>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Building className="w-3 h-3 mr-1" />
                <span className="truncate">{application.opportunity.organization.companyName}</span>
              </div>
              
              {/* Compensation */}
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {application.opportunity.type.replace('-', ' ')}
                </Badge>
                
                {salary && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <DollarSign className="w-2 h-2" />
                    {salary}
                  </Badge>
                )}
                
                {equity && (
                  <Badge variant="outline" className="text-xs">
                    {equity} Equity
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end gap-2">
            <Badge className={getStatusColor(application.status)}>
              {getStatusText(application.status)}
            </Badge>
            <div className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Applied {new Date(application.createdAt!).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Cover Letter Preview */}
        {application.coverLetter && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 line-clamp-2">
              {application.coverLetter}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
