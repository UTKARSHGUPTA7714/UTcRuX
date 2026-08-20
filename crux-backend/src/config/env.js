const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@crux.app',
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',
  JWT_SECRET: process.env.JWT_SECRET || 'crux-fallback-secret-2026',
  USE_DYNAMODB: process.env.USE_DYNAMODB === 'true'
};
