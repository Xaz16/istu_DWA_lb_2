import type { Request, Response, NextFunction } from 'express';
import { verifyBearerToken, verifyAccessToken } from '../lib/jwt.js';
import { ACCESS_TOKEN_COOKIE } from '../constants/authCookies.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  let payload = verifyBearerToken(req.headers.authorization);
  if (!payload && req.cookies && typeof req.cookies[ACCESS_TOKEN_COOKIE] === 'string') {
    payload = verifyAccessToken(req.cookies[ACCESS_TOKEN_COOKIE]);
  }
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.auth = {
    userId: Number(payload.sub),
    login: String(payload.login ?? ''),
    role: String(payload.role ?? ''),
  };
  next();
}
