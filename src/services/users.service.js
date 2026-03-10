const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersRepo = require('../repositories/users.repository');
const config = require('../config');

class UsersService {
  async createUser(data) {
    // check if user already exists
    const existing = await usersRepo.findByEmail(data.email);
    if (existing) {
      throw { status: 409, message: 'User with that email already exists' };
    }

    // hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // create user
    const user = await usersRepo.create({
      organization_id: data.organization_id,
      email: data.email,
      password_hash: passwordHash,
      full_name: data.full_name,
      role: data.role,
      is_active: true,
    });

    // return without password
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      organization_id: user.organization_id,
    };
  }

  async login(email, password) {
    const user = await usersRepo.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Invalid credentials' };
    }
    // console.log(user);
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    // generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, organization_id: user.organization_id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }
}

module.exports = new UsersService();
