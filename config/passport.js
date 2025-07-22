const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Get the backend URLs from environment
const BACKEND_URLS =
  process.env.NODE_ENV === 'production' ? process.env.BACKEND_URLS.split(',').map((url) => url.trim()) : [process.env.BACKEND_URL_DEV];

// Use the first backend URL as the default
const BACKEND_URL = BACKEND_URLS[0];

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', JSON.stringify(profile, null, 2));

        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          console.error('No email provided by Google');
          return done(new Error('No email provided by Google'));
        }

        const email = profile.emails[0].value;
        const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Unknown';
        const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || 'Unknown';

        console.log('Processing Google login for:', { email, firstName, lastName });

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          console.log('Existing user found:', user._id);
          return done(null, user);
        }

        // If user doesn't exist, create new user
        console.log('Creating new user for:', email);
        user = await User.create({
          firstName,
          lastName,
          email,
          password: 'google-oauth-' + Math.random().toString(36).slice(-8), // Generate random password for OAuth users
        });

        console.log('New user created:', user._id);
        return done(null, user);
      } catch (error) {
        console.error('Google auth error:', error);
        return done(error, null);
      }
    },
  ),
);

// These are required even though we're using JWT
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user._id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user:', id);
    const user = await User.findById(id);
    if (!user) {
      console.error('User not found during deserialization:', id);
      return done(new Error('User not found'));
    }
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

module.exports = passport;
