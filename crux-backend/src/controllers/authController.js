const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

async function loginAdmin(req, res) {
  const { email, username, password } = req.body;
  const inputEmail = email || username;

  if (!inputEmail || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

  // Validate admin email/username
  const isValidUser = (inputEmail.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) || (inputEmail === 'admin');

  if (!isValidUser) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify password: compare against env hash or direct match for fallback
  let isPasswordValid = false;
  if (env.ADMIN_PASSWORD_HASH && env.ADMIN_PASSWORD_HASH.startsWith('$2a$')) {
    isPasswordValid = bcrypt.compareSync(password, env.ADMIN_PASSWORD_HASH);
  } else {
    // Development fallback
    isPasswordValid = (password === 'cruxadmin2026');
  }

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { email: env.ADMIN_EMAIL, role: 'admin' },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    message: 'Admin authentication successful',
    expiresIn: '7d'
  });
}

module.exports = {
  loginAdmin
};
