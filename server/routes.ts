import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupPassportAuth, passport } from "./auth";
import bcrypt from "bcryptjs";
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
  setupPassportAuth(app);

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

  // Email/Password Authentication Routes
  const signupSchema = z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.string().email(),
    password: z.string().min(8),
  });

  const signinSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validated = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validated.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(validated.password, saltRounds);

      // Create user
      const user = await storage.createEmailUser({
        email: validated.email,
        firstName: validated.firstName,
        lastName: validated.lastName,
        passwordHash,
      });

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after signup:", err);
          return res.status(500).json({ message: "Account created but login failed" });
        }
        res.json({ message: "Account created successfully", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post('/api/auth/signin', (req, res, next) => {
    try {
      const validated = signinSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          console.error("Authentication error:", err);
          return res.status(500).json({ message: "Authentication failed" });
        }
        
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid email or password" });
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            return res.status(500).json({ message: "Login failed" });
          }
          res.json({ message: "Signed in successfully", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // Google OAuth Routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/signin' }),
    (req, res) => {
      // Successful authentication, redirect to user type selection or home
      const user = req.user as any;
      if (!user?.userType) {
        res.redirect('/user-type-selection');
      } else {
        res.redirect('/');
      }
    }
  );

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
      const profileData = insertProfileSchema.parse({ ...req.body, userId });
      
      const existingProfile = await storage.getProfile(userId);
      if (existingProfile) {
        const updatedProfile = await storage.updateProfile(userId, req.body);
        return res.json(updatedProfile);
      }
      
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating/updating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create/update profile" });
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

  app.post("/api/opportunities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organization = await storage.getOrganization(userId);
      
      if (!organization) {
        return res.status(403).json({ message: "Only organizations can post opportunities" });
      }

      const opportunityData = insertOpportunitySchema.parse({
        ...req.body,
        organizationId: organization.id,
      });
      
      const opportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });

  app.get("/api/my-opportunities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organization = await storage.getOrganization(userId);
      
      if (!organization) {
        return res.json([]);
      }

      const opportunities = await storage.getOpportunitiesByOrganization(organization.id);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching user opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
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

  app.post("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        userId,
      });
      
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get("/api/opportunities/:id/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const opportunityId = parseInt(req.params.id);
      
      // Verify the user owns this opportunity
      const opportunity = await storage.getOpportunity(opportunityId);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }

      const organization = await storage.getOrganization(userId);
      if (!organization || opportunity.organizationId !== organization.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const applications = await storage.getApplicationsByOpportunity(opportunityId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching opportunity applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
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
      const messages = await storage.getMessagesBetweenUsers(userId, req.params.otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        fromUserId: userId,
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
