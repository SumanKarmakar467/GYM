import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

let strategyRegistered = false;

export const hasGoogleOAuth = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const ensureGoogleStrategy = () => {
  if (strategyRegistered) {
    return true;
  }

  if (!hasGoogleOAuth()) {
    return false;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            return done(new Error("Google account did not return an email address."));
          }

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (!user) {
            user = await User.create({
              name: profile.displayName || "GymForge User",
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || ""
            });
          } else if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos?.[0]?.value || "";
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  strategyRegistered = true;
  return true;
};

export default passport;
