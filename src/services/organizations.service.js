const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const usersRepo = require('../repositories/users.repository');
const organizationsRepo = require('../repositories/organizations.repository');
const { sendVerificationEmail } = require('../config/email');
const config = require('../config');
const logger = require('../config/logger');

class OrganizationsService {
  async registerOrganization(data) {
    // check if org already exists by slug
    const slug = data.company_name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const existing = await organizationsRepo.findBySlug(slug);
    if (existing) {
      throw { status: 409, message: 'Organization with that name already exists' };
    }

    // check if user email already exists
    const existingUser = await usersRepo.findByEmail(data.email);
    if (existingUser) {
      throw { status: 409, message: 'User with that email already exists' };
    }

    // create organization
    const org = await organizationsRepo.create({
      name: data.company_name,
      slug,
      subscription_tier: 'starter',
      settings: {
        industry: data.industry,
        company_size: data.company_size,
        procurement_focus: data.procurement_focus,
        email_verified: false,
      },
    });
    logger.info(`Organization created: ${org.id}`);

    // hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // create admin user for organization
    const user = await usersRepo.create({
      organization_id: org.id,
      email: data.email,
      password_hash: passwordHash,
      full_name: data.company_name,
      role: 'admin',
      is_active: true,
    });
    logger.info(`Admin user created: ${user.id}`);

    // generate email verification token (expires in 24h)
    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'email_verification' },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    // send verification email
    try {
      await sendVerificationEmail(user.email, org.name, verificationToken);
    } catch (err) {
      logger.error('Failed to send verification email during registration', err);
      const reason = err && (err.response || err.message || err.code);
      const message = config.nodeEnv === 'development' && reason
        ? `Failed to send verification email. ${reason}`
        : 'Failed to send verification email. Please try again.';
      throw { status: 500, message };
    }

    return {
      organization_id: org.id,
      user_id: user.id,
      email: user.email,
      organization_name: org.name,
      message: 'Organization created. Please check your email to verify.',
    };
  }

  async verifyEmail(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      if (decoded.type !== 'email_verification') {
        throw { status: 400, message: 'Invalid token type' };
      }

      const user = await usersRepo.findById(decoded.userId);
      if (!user) {
        throw { status: 404, message: 'User not found' };
      }

      // mark organization as email verified
      await organizationsRepo.updateSettings(user.organization_id, {
        email_verified: true,
      });

      return {
        success: true,
        message: 'Email verified successfully',
        user_id: user.id,
        organization_id: user.organization_id,
      };
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw { status: 401, message: 'Verification token expired' };
      }
      throw { status: 400, message: 'Invalid verification token' };
    }
  }

  async resendVerificationEmail(email) {
    const user = await usersRepo.findByEmail(email);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const org = await organizationsRepo.findById(user.organization_id);

    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'email_verification' },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    try {
      await sendVerificationEmail(user.email, org.name, verificationToken);
    } catch (err) {
      logger.error('Failed to resend verification email', err);
      throw err;
    }

    return { success: true, message: 'Verification email sent' };
  }
}

module.exports = new OrganizationsService();

