import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUser } from '../types';

/** Accepts only `Authorization: Bearer <jwt>` (admin API; no cookie fallback). */
@Injectable()
export class JwtBearerAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearer(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException({
        error: 'Missing Authorization: Bearer <access_token>',
      });
    }
    try {
      const payload = this.jwt.verify<{ sub: number | string; login?: string; role?: string }>(token);
      const user: AuthUser = {
        userId: Number(payload.sub),
        login: String(payload.login ?? ''),
        role: String(payload.role ?? ''),
      };
      request.user = user;
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
