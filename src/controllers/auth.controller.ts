import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/user.repository.js';
import { signAccessToken, getExpiresIn, cookieMaxAgeMsFromToken } from '../lib/jwt.js';
import { ACCESS_TOKEN_COOKIE } from '../constants/authCookies.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { login: loginStr, password } = req.body as { login: string; password: string };
  const user = await userRepository.findByLogin(loginStr);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid login or password' });
    return;
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
}

export function me(req: Request, res: Response): void {
  const auth = req.auth!;
  res.json({
    id: auth.userId,
    login: auth.login,
    role: auth.role,
  });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/', sameSite: 'lax' });
  res.json({ ok: true });
}
