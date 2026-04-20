const express = require('express');
const bcrypt = require('bcrypt');
const { body } = require('express-validator');
const { pool } = require('../db/pool');
const { sendValidationErrors } = require('../middleware/validate');
const { requireAuth } = require('../middleware/requireAuth');
const { signAccessToken, getExpiresIn, cookieMaxAgeMsFromToken } = require('../lib/jwt');
const { ACCESS_TOKEN_COOKIE } = require('../constants/authCookies');

const router = express.Router();

router.post(
  '/auth/login',
  [
    body('login').trim().notEmpty().isLength({ max: 128 }).withMessage('login is required'),
    body('password').notEmpty().withMessage('password is required'),
  ],
  sendValidationErrors,
  async (req, res, next) => {
    const { login, password } = req.body;
    try {
      const { rows } = await pool.query(
        `SELECT id, login, password_hash AS "passwordHash", role FROM users WHERE login = $1`,
        [login]
      );
      const user = rows[0];
      const ok = user && (await bcrypt.compare(password, user.passwordHash));
      if (!ok) {
        return res.status(401).json({ error: 'Invalid login or password' });
      }

      const token = signAccessToken({
        id: user.id,
        login: user.login,
        role: user.role,
      });

      const maxAge = cookieMaxAgeMsFromToken(token);
      res.cookie(ACCESS_TOKEN_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge,
        secure: process.env.NODE_ENV === 'production',
      });

      res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: getExpiresIn(),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/auth/me', requireAuth, (req, res) => {
  res.json({
    id: req.auth.userId,
    login: req.auth.login,
    role: req.auth.role,
  });
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/', sameSite: 'lax' });
  res.json({ ok: true });
});

module.exports = router;
