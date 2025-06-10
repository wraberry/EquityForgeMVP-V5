import type { User, Profile, Organization, Opportunity, Application, Message } from "@shared/schema";

export type { Message } from "@shared/schema";

export type UserWithProfile = User & {
  additionalData?: Profile | Organization;
};

export type OpportunityWithOrganization = Opportunity & {
  organization: Organization;
};

export type ApplicationWithOpportunity = Application & {
  opportunity: OpportunityWithOrganization;
};

export type ApplicationWithUser = Application & {
  user: User;
};

export type Conversation = {
  user: User;
  lastMessage: Message;
  unreadCount: number;
};

export type OpportunityType = "full-time" | "part-time" | "contract" | "co-founder";

export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected";

export type UserType = "talent" | "organization";
