import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../common/auth-cookie';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import type { AuthUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto);
    const maxAge = this.auth.cookieMaxAgeMs(result.access_token);
    res.cookie(ACCESS_TOKEN_COOKIE, result.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge,
      secure: process.env.NODE_ENV === 'production',
    });
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return { id: user.userId, login: user.login, role: user.role };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return { ok: true };
  }
}
