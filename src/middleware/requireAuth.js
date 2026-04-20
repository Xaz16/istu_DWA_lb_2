const { verifyBearerToken, verifyAccessToken } = require('../lib/jwt');
const { ACCESS_TOKEN_COOKIE } = require('../constants/authCookies');

function requireAuth(req, res, next) {
  let payload = verifyBearerToken(req.headers.authorization);
  if (!payload && req.cookies && req.cookies[ACCESS_TOKEN_COOKIE]) {
    payload = verifyAccessToken(req.cookies[ACCESS_TOKEN_COOKIE]);
  }
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.auth = {
    userId: Number(payload.sub),
    login: payload.login,
    role: payload.role,
  };
  next();
}

module.exports = { requireAuth };
