import {
  users,
  profiles,
  organizations,
  opportunities,
  applications,
  messages,
  type User,
  type UpsertUser,
  type Profile,
  type Organization,
  type Opportunity,
  type Application,
  type Message,
  type InsertProfile,
  type InsertOrganization,
  type InsertOpportunity,
  type InsertApplication,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth and Email Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserType(id: string, userType: string): Promise<User>;
  createEmailUser(userData: { email: string; firstName: string; lastName: string; passwordHash: string }): Promise<User>;

  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;

  // Organization operations
  getOrganization(userId: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(userId: string, organization: Partial<InsertOrganization>): Promise<Organization>;

  // Opportunity operations
  getOpportunities(): Promise<(Opportunity & { organization: Organization })[]>;
  getOpportunity(id: number): Promise<(Opportunity & { organization: Organization }) | undefined>;
  getOpportunitiesByOrganization(organizationId: number): Promise<Opportunity[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity>;

  // Application operations
  getApplicationsByUser(userId: string): Promise<(Application & { opportunity: Opportunity & { organization: Organization } })[]>;
  getApplicationsByOpportunity(opportunityId: number): Promise<(Application & { user: User })[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;

  // Message operations
  getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]>;
  getConversations(userId: string): Promise<{ user: User; lastMessage: Message; unreadCount: number }[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserType(id: string, userType: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ userType, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createEmailUser(userData: { email: string; firstName: string; lastName: string; passwordHash: string }): Promise<User> {
    const { v4: uuidv4 } = await import("uuid");
    const [user] = await db
      .insert(users)
      .values({
        id: uuidv4(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: userData.passwordHash,
        authProvider: "email",
      })
      .returning();
    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async getOrganization(userId: string): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.userId, userId));
    return organization;
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [newOrganization] = await db.insert(organizations).values(organization).returning();
    return newOrganization;
  }

  async updateOrganization(userId: string, organization: Partial<InsertOrganization>): Promise<Organization> {
    const [updatedOrganization] = await db
      .update(organizations)
      .set({ ...organization, updatedAt: new Date() })
      .where(eq(organizations.userId, userId))
      .returning();
    return updatedOrganization;
  }

  async getOpportunities(): Promise<(Opportunity & { organization: Organization })[]> {
    const result = await db
      .select()
      .from(opportunities)
      .leftJoin(organizations, eq(opportunities.organizationId, organizations.id))
      .where(eq(opportunities.status, "active"))
      .orderBy(desc(opportunities.createdAt));

    return result.map(row => ({
      ...row.opportunities,
      organization: row.organizations!,
    }));
  }

  async getOpportunity(id: number): Promise<(Opportunity & { organization: Organization }) | undefined> {
    const [result] = await db
      .select()
      .from(opportunities)
      .leftJoin(organizations, eq(opportunities.organizationId, organizations.id))
      .where(eq(opportunities.id, id));

    if (!result) return undefined;

    return {
      ...result.opportunities,
      organization: result.organizations!,
    };
  }

  async getOpportunitiesByOrganization(organizationId: number): Promise<Opportunity[]> {
    return await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.organizationId, organizationId))
      .orderBy(desc(opportunities.createdAt));
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const [newOpportunity] = await db.insert(opportunities).values(opportunity).returning();
    return newOpportunity;
  }

  async updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity> {
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set({ ...opportunity, updatedAt: new Date() })
      .where(eq(opportunities.id, id))
      .returning();
    return updatedOpportunity;
  }

  async getApplicationsByUser(userId: string): Promise<(Application & { opportunity: Opportunity & { organization: Organization } })[]> {
    const result = await db
      .select()
      .from(applications)
      .leftJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .leftJoin(organizations, eq(opportunities.organizationId, organizations.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));

    return result.map(row => ({
      ...row.applications,
      opportunity: {
        ...row.opportunities!,
        organization: row.organizations!,
      },
    }));
  }

  async getApplicationsByOpportunity(opportunityId: number): Promise<(Application & { user: User })[]> {
    const result = await db
      .select()
      .from(applications)
      .leftJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.opportunityId, opportunityId))
      .orderBy(desc(applications.createdAt));

    return result.map(row => ({
      ...row.applications,
      user: row.users!,
    }));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.fromUserId, user1Id), eq(messages.toUserId, user2Id)),
          and(eq(messages.fromUserId, user2Id), eq(messages.toUserId, user1Id))
        )
      )
      .orderBy(messages.createdAt);
  }

  async getConversations(userId: string): Promise<{ user: User; lastMessage: Message; unreadCount: number }[]> {
    // This is a simplified version - in production, you'd want a more efficient query
    const allMessages = await db
      .select()
      .from(messages)
      .leftJoin(users, or(eq(messages.fromUserId, users.id), eq(messages.toUserId, users.id)))
      .where(or(eq(messages.fromUserId, userId), eq(messages.toUserId, userId)))
      .orderBy(desc(messages.createdAt));

    const conversations = new Map<string, { user: User; lastMessage: Message; unreadCount: number }>();

    for (const row of allMessages) {
      const otherUserId = row.messages.fromUserId === userId ? row.messages.toUserId : row.messages.fromUserId;
      
      if (!conversations.has(otherUserId)) {
        const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
        if (otherUser) {
          conversations.set(otherUserId, {
            user: otherUser,
            lastMessage: row.messages,
            unreadCount: 0,
          });
        }
      }
      
      if (row.messages.toUserId === userId && !row.messages.isRead) {
        const conv = conversations.get(otherUserId);
        if (conv) {
          conv.unreadCount++;
        }
      }
    }

    return Array.from(conversations.values());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }
}

export const storage = new DatabaseStorage();
