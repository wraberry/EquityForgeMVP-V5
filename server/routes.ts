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
import bcrypt from "bcryptjs";

// Session-based authentication middleware for email/password auth
const isSessionAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Combined authentication middleware (accepts both Replit and session auth)
const isAuthenticatedAny = (req: any, res: any, next: any) => {
  // Check Replit auth first
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  // Check session auth
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Email/Password authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Validate input
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createEmailUser({
        email,
        firstName,
        lastName,
        passwordHash,
      });

      // Set session
      req.session.userId = user.id;
      req.session.authProvider = "email";

      res.status(201).json({ message: "User created successfully", user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        userType: user.userType,
        authProvider: user.authProvider 
      }});
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.authProvider = "email";

      res.json({ message: "Signed in successfully", user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        userType: user.userType,
        authProvider: user.authProvider 
      }});
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticatedAny, async (req: any, res) => {
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get("/api/messages/:otherUserId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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