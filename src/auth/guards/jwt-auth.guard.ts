import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../../common/auth-cookie';
import type { AuthUser } from '../types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    let token = this.extractBearer(req.headers.authorization);
    if (!token) {
      const c = req.cookies?.[ACCESS_TOKEN_COOKIE];
      if (typeof c === 'string') token = c;
    }
    if (!token) {
      throw new UnauthorizedException({ error: 'Unauthorized' });
    }
    try {
      const payload = this.jwt.verify<{ sub: number | string; login?: string; role?: string }>(token);
      const user: AuthUser = {
        userId: Number(payload.sub),
        login: String(payload.login ?? ''),
        role: String(payload.role ?? ''),
      };
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException({ error: 'Unauthorized' });
    }
  }

  private extractBearer(authorizationHeader: string | undefined): string | null {
    if (!authorizationHeader || typeof authorizationHeader !== 'string') return null;
    const [scheme, token] = authorizationHeader.split(/\s+/);
    if (!token || scheme.toLowerCase() !== 'bearer') return null;
    return token;
  }
}
