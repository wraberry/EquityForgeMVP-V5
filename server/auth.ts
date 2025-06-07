import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import type { Express } from "express";

// Configure Local Strategy (email/password)
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.passwordHash) {
        return done(null, false, { message: 'Please sign in with your original method' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName;
        const lastName = profile.name?.familyName;
        const profileImageUrl = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        // Check if user already exists
        let user = await storage.getUserByEmail(email);
        
        if (user) {
          // Update user info if needed
          if (user.authProvider !== 'google') {
            user = await storage.updateUser(user.id, {
              authProvider: 'google',
              profileImageUrl: profileImageUrl || user.profileImageUrl,
            });
          }
          return done(null, user);
        }

        // Create new user
        const newUser = await storage.upsertUser({
          id: uuidv4(),
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          profileImageUrl,
          authProvider: 'google',
        });

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export function setupPassportAuth(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());
}

export { passport };