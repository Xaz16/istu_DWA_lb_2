import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

const DEFAULT_DEV_SECRET = 'dev-insecure-change-me';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return DEFAULT_DEV_SECRET;
}

function getExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '24h';
}

export type JwtUserPayload = JwtPayload & {
  sub: string | number;
  login?: string;
  role?: string;
};

export function signAccessToken(user: { id: number; login: string; role: string }): string {
  const payload = {
    sub: user.id,
    login: user.login,
    role: user.role,
  };
  const signOptions = { expiresIn: getExpiresIn() } as SignOptions;
  return jwt.sign(payload, getJwtSecret(), signOptions);
}

export function verifyAccessToken(token: string): JwtUserPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === 'string') return null;
    return decoded as JwtUserPayload;
  } catch {
    return null;
  }
}

export function verifyBearerToken(authorizationHeader: string | undefined): JwtUserPayload | null {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }
  const [scheme, token] = authorizationHeader.split(/\s+/);
  if (!token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }
  return verifyAccessToken(token);
}

export function cookieMaxAgeMsFromToken(token: string): number {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string' || decoded.exp == null) {
    return 24 * 60 * 60 * 1000;
  }
  return Math.max(decoded.exp * 1000 - Date.now(), 0);
}

export { getJwtSecret, getExpiresIn };
