const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./index');
const organizationsService = require('../services/organizations.service');
const kpisService = require('../services/kpis.service');
const logger = require('./logger');

// Configure Google OAuth strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Extract user info from Google profile
      const email = profile.emails[0].value;
      const fullName = profile.displayName;
      const googleId = profile.id;

      // Check if user exists
      const existingUser = await require('../repositories/users.repository').findByEmail(email);

      if (existingUser) {
        // User exists, return them
        return done(null, existingUser);
      }

      // New user - create organization and user
      // For Google signup, we'll create a minimal org with default settings
      const orgResult = await organizationsService.registerOrganization({
        company_name: `${fullName}'s Company`,
        email: email,
        password: Math.random().toString(36), // Random password since Google auth
        industry: 'other',
        company_size: 'small',
        procurement_focus: 'general',
      });

      // Mark email as verified since Google verified it
      await require('../repositories/organizations.repository').updateSettings(
        orgResult.organization_id,
        { email_verified: true, google_id: googleId }
      );

      // Create default KPI config
      await kpisService.createDefaultConfig(
        orgResult.organization_id,
        orgResult.user_id,
        'other',
        'shipper'
      );

      // Get the created user
      const newUser = await require('../repositories/users.repository').findById(orgResult.user_id);

      logger.info(`Created new user via Google OAuth: ${newUser.email}`);
      return done(null, newUser);

    } catch (err) {
      logger.error('Google OAuth error:', err);
      return done(err, null);
    }
  }));
} else {
  logger.warn('Google OAuth credentials not provided. Google authentication will not be available.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await require('../repositories/users.repository').findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;