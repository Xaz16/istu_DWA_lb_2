const jwt = require('jsonwebtoken');

const DEFAULT_DEV_SECRET = 'dev-insecure-change-me';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return DEFAULT_DEV_SECRET;
}

function getExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '24h';
}

function signAccessToken(user) {
  const payload = {
    sub: user.id,
    login: user.login,
    role: user.role,
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: getExpiresIn() });
}

function verifyBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }
  const [scheme, token] = authorizationHeader.split(/\s+/);
  if (!token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

module.exports = { signAccessToken, verifyBearerToken, getJwtSecret, getExpiresIn };
