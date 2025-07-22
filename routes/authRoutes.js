const express = require('express');
const { check } = require('express-validator');
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('passport');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const signupValidation = [
  check('firstName', 'First name is required').not().isEmpty(),
  check('lastName', 'Last name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
];

const loginValidation = [check('email', 'Please include a valid email').isEmail(), check('password', 'Password is required').exists()];

// Regular auth routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);

// Debug endpoint to check environment
router.get('/debug', (req, res) => {
  const debug = {
    nodeEnv: process.env.NODE_ENV,
    backendUrls: process.env.BACKEND_URLS,
    frontendUrls: process.env.FRONTEND_URLS,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set',
    currentUrl: `${req.protocol}://${req.get('host')}`,
    googleCallbackUrl: `${req.protocol}://${req.get('host')}/api/auth/google/callback`,
    referer: req.headers.referer,
    origin: req.headers.origin,
  };
  console.log('Debug Info:', debug);
  res.json(debug);
});

// Store frontend URL in session
router.use((req, res, next) => {
  if (req.headers.referer) {
    const url = new URL(req.headers.referer);
    req.session.frontendUrl = url.origin;
    console.log('Stored frontend URL:', req.session.frontendUrl);
  }
  next();
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Store the frontend URL in session
  if (req.headers.referer) {
    const url = new URL(req.headers.referer);
    req.session.frontendUrl = url.origin;
    console.log('Stored frontend URL for OAuth:', req.session.frontendUrl);
  }

  console.log('Starting Google OAuth flow');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('Received Google callback');
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/login?error=google_auth_failed',
    })(req, res, next);
  },
  async (req, res) => {
    try {
      console.log('Processing Google callback, user:', req.user?._id);

      if (!req.user) {
        console.error('No user data in request');
        throw new Error('Authentication failed');
      }

      // Generate JWT token
      const token = generateToken(req.user._id);

      // Get the stored frontend URL or fallback to environment
      let frontendUrl = req.session.frontendUrl;
      if (!frontendUrl) {
        console.log('No stored frontend URL, using environment default');
        frontendUrl = process.env.FRONTEND_URLS.split(',')[0].trim();
      }
      console.log('Using frontend URL:', frontendUrl);

      const redirectUrl = `${frontendUrl}/oauth-callback?token=${token}`;
      console.log('Redirecting to:', redirectUrl);

      // Redirect to frontend with token
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      const frontendUrl = req.session.frontendUrl || process.env.FRONTEND_URLS.split(',')[0].trim();
      res.redirect(`${frontendUrl}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
    }
  },
);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
