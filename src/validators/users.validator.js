const { z } = require('zod');

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email').nonempty('Email is required').toLowerCase(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .nonempty('Password is required'),
    full_name: z.string().min(2, 'Full name must be at least 2 characters').nonempty('Full name is required'),
    role: z.enum(['admin', 'manager', 'analyst', 'viewer'], {
      errorMap: () => ({ message: 'Role is invalid or missing' }),
    }),
    organization_id: z.string().uuid('Invalid organization ID').nonempty('Organization ID is required'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email').nonempty('Email is required').toLowerCase(),
    password: z.string().min(1, 'Password required').nonempty('Password is required'),
  }),
});

module.exports = { createUserSchema, loginSchema };
