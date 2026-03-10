const usersService = require('../services/users.service');
const organizationsService = require('../services/organizations.service');
const kpisService = require('../services/kpis.service');
const asyncHandler = require('../utils/asyncHandler');

const signup = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.body);
  res.status(201).json({ success: true, user });
});

const login = asyncHandler(async (req, res) => {
  const result = await usersService.login(req.body.email, req.body.password);
  res.json({ success: true, ...result });
});

const registerOrganization = asyncHandler(async (req, res) => {
  const result = await organizationsService.registerOrganization(req.body);
  res.status(201).json({ success: true, ...result });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const result = await organizationsService.verifyEmail(req.body.token);
  res.json({ success: true, ...result });
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const result = await organizationsService.resendVerificationEmail(req.body.email);
  res.json({ success: true, ...result });
});

module.exports = { signup, login, registerOrganization, verifyEmail, resendVerificationEmail };
