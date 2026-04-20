const { verifyBearerToken } = require('../lib/jwt');

function requireAuth(req, res, next) {
  const payload = verifyBearerToken(req.headers.authorization);
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
