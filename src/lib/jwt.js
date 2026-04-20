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

function verifyAccessToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

function verifyBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }
  const [scheme, token] = authorizationHeader.split(/\s+/);
  if (!token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }
  return verifyAccessToken(token);
}

function cookieMaxAgeMsFromToken(token) {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) {
    return 24 * 60 * 60 * 1000;
  }
  return Math.max(decoded.exp * 1000 - Date.now(), 0);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  verifyBearerToken,
  getJwtSecret,
  getExpiresIn,
  cookieMaxAgeMsFromToken,
};
