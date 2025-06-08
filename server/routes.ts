import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import "./types";
import {
  insertProfileSchema,
  insertOrganizationSchema,
  insertOpportunitySchema,
  insertApplicationSchema,
  insertMessageSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get profile or organization based on user type
      let additionalData = null;
      if (user.userType === 'talent') {
        additionalData = await storage.getProfile(userId);
      } else if (user.userType === 'organization') {
        additionalData = await storage.getOrganization(userId);
      }

      res.json({ ...user, additionalData });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/user-type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userType } = req.body;
      
      if (!userType || !['talent', 'organization'].includes(userType)) {
        return res.status(400).json({ message: "Invalid user type" });
      }

      const updatedUser = await storage.updateUserType(userId, userType);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user type:", error);
      res.status(500).json({ message: "Failed to update user type" });
    }
  });

  // Profile routes
  app.get("/api/profiles/:userId", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profiles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = { ...req.body, userId };
      const validated = insertProfileSchema.parse(profileData);
      const profile = await storage.createProfile(validated);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.patch("/api/profiles/:userId", async (req, res) => {
    try {
      const updates = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(req.params.userId, updates);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Organization routes
  app.get("/api/organizations/:userId", async (req, res) => {
    try {
      const organization = await storage.getOrganization(req.params.userId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      console.error("Error fetching organization:", error);
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  app.post("/api/organizations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizationData = insertOrganizationSchema.parse({ ...req.body, userId });
      
      const existingOrganization = await storage.getOrganization(userId);
      if (existingOrganization) {
        const updatedOrganization = await storage.updateOrganization(userId, req.body);
        return res.json(updatedOrganization);
      }
      
      const organization = await storage.createOrganization(organizationData);
      res.status(201).json(organization);
    } catch (error) {
      console.error("Error creating/updating organization:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create/update organization" });
    }
  });

  // Company onboarding routes
  app.post("/api/organizations/talent-needs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const talentNeedsData = req.body;
      
      // Update organization with talent needs
      const organization = await storage.updateOrganization(userId, talentNeedsData);
      res.json(organization);
    } catch (error) {
      console.error("Error saving talent needs:", error);
      res.status(500).json({ message: "Failed to save talent needs" });
    }
  });

  app.post("/api/organizations/invite", isAuthenticated, async (req: any, res) => {
    try {
      const { email, role, message } = req.body;
      const inviterUserId = req.user.claims.sub;
      
      // Return success - in production this would send an email invitation
      res.json({ 
        message: "Invitation sent successfully",
        invitedEmail: email,
        role,
        customMessage: message 
      });
    } catch (error) {
      console.error("Error sending invitation:", error);
      res.status(500).json({ message: "Failed to send invitation" });
    }
  });

  // Opportunity routes
  app.get("/api/opportunities", async (req, res) => {
    try {
      const opportunities = await storage.getOpportunities();
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  app.get("/api/my-opportunities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== "organization") {
        return res.status(403).json({ message: "Only organizations can access this endpoint" });
      }

      const organization = await storage.getOrganization(userId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      const opportunities = await storage.getOpportunitiesByOrganization(organization.id);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching user opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/opportunities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== "organization") {
        return res.status(403).json({ message: "Only organizations can post opportunities" });
      }

      const organization = await storage.getOrganization(userId);
      if (!organization) {
        return res.status(404).json({ message: "Organization profile required" });
      }

      const opportunityData = { ...req.body, organizationId: organization.id };
      const validated = insertOpportunitySchema.parse(opportunityData);
      const opportunity = await storage.createOpportunity(validated);
      res.status(201).json(opportunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating opportunity:", error);
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });

  // Application routes
  app.get("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/opportunities/:id/applications", isAuthenticated, async (req: any, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      // Verify user owns this opportunity
      const user = await storage.getUser(userId);
      if (user?.userType !== "organization") {
        return res.status(403).json({ message: "Only organizations can view applications" });
      }

      const applications = await storage.getApplicationsByOpportunity(opportunityId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching opportunity applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== "talent") {
        return res.status(403).json({ message: "Only talent can submit applications" });
      }

      const applicationData = { ...req.body, userId };
      const validated = insertApplicationSchema.parse(applicationData);
      const application = await storage.createApplication(validated);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Message routes
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages/:otherUserId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const otherUserId = req.params.otherUserId;
      const messages = await storage.getMessagesBetweenUsers(userId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const messageData = { ...req.body, senderId: userId };
      const validated = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validated);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}