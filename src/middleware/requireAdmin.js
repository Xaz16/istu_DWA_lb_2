function requireAdmin(req, res, next) {
  if (!req.auth || req.auth.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

module.exports = { requireAdmin };
