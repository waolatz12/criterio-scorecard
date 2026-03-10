const db = require('../config/database');
const bcrypt = require('bcrypt');
const usersRepo = require('../repositories/users.repository');
const organizationsRepo = require('../repositories/organizations.repository');
const logger = require('../config/logger');

async function seed() {
  try {
    logger.info('Starting seed...');

    // create dummy organization
    const org = await organizationsRepo.create({
      name: 'Test Organization',
      slug: 'test-org',
      subscription_tier: 'pro',
    });
    logger.info(`Created organization: ${org.id}`);

    // hash password
    const passwordHash = await bcrypt.hash('password123', 10);

    // create dummy users
    const user1 = await usersRepo.create({
      organization_id: org.id,
      email: 'admin@test.com',
      password_hash: passwordHash,
      full_name: 'Admin User',
      role: 'admin',
      is_active: true,
    });
    logger.info(`Created user 1: ${user1.email}`);

    const user2 = await usersRepo.create({
      organization_id: org.id,
      email: 'manager@test.com',
      password_hash: passwordHash,
      full_name: 'Manager User',
      role: 'manager',
      is_active: true,
    });
    logger.info(`Created user 2: ${user2.email}`);

    logger.info('Seed complete!');
    process.exit(0);
  } catch (err) {
    logger.error('Seed error', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
