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

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }),
  (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user._id);

      // Get the frontend URL from environment or use default
      const frontendUrl = process.env.FRONTEND_URLS.split(',')[0].trim();

      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  },
);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
