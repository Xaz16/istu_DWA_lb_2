import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../types';

export const CurrentUser = createParamDecorator(
  (_decoratorArgument: unknown, context: ExecutionContext): AuthUser => {
    const req = context.switchToHttp().getRequest<Request>();
    return req.user as AuthUser;
  },
);
