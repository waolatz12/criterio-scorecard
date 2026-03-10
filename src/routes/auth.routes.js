const express = require('express');
const router = express.Router();
const { z } = require('zod');
const passport = require('../config/passport');
const {
  signup,
  login,
  registerOrganization,
  verifyEmail,
  resendVerificationEmail,
} = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const {
  createUserSchema,
  loginSchema,
} = require('../validators/users.validator');
const {
  organizationSignupSchema,
  emailVerificationSchema,
} = require('../validators/organizations.validator');

// User signup (for existing orgs)
router.post('/signup', validate(createUserSchema), signup);

// Organization registration
router.post('/register-org', validate(organizationSignupSchema), registerOrganization);

// Email verification
router.post('/verify-email', validate(emailVerificationSchema), verifyEmail);

// Resend verification email
const resendSchema = z.object({
  body: z.object({ email: z.string().email('Invalid email').nonempty('Email is required') }),
});
router.post('/resend-verification', validate(resendSchema), resendVerificationEmail);

// User login
router.post('/login', validate(loginSchema), login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const jwt = require('jsonwebtoken');
    const config = require('../config');
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        organization_id: req.user.organization_id
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/dashboard.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      full_name: req.user.full_name,
      role: req.user.role,
      organization_id: req.user.organization_id,
    }))}`);
  }
);

module.exports = router;
