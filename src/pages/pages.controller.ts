import { Body, Controller, Get, Post, Query, Req, Res, Redirect, Render } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { AdminService } from '../admin/admin.service';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { ACCESS_TOKEN_COOKIE } from '../common/auth-cookie';

type SessionUser = { userId: number; login: string; role: string };

function formatDateTimeDisplay(dateTime: Date | string): string {
  if (typeof dateTime === 'string') {
    return dateTime.includes('T')
      ? dateTime.replace('T', ' ').slice(0, 19)
      : dateTime.slice(0, 19);
  }
  return dateTime.toISOString().replace('T', ' ').slice(0, 19);
}

@Controller()
export class PagesController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
    private readonly jwt: JwtService,
  ) {}

  private sessionUser(req: Request): SessionUser | null {
    const raw = req.cookies?.[ACCESS_TOKEN_COOKIE];
    if (typeof raw !== 'string' || !raw) return null;
    try {
      const p = this.jwt.verify<{ sub: number | string; login?: string; role?: string }>(raw);
      return {
        userId: Number(p.sub),
        login: String(p.login ?? ''),
        role: String(p.role ?? ''),
      };
    } catch {
      return null;
    }
  }

  @Get('login')
  @Render('login')
  loginGet(@Query('error') error?: string) {
    return { title: 'Вход', error: error === 'credentials' };
  }

  @Post('login')
  async loginPost(@Body() dto: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(dto);
      const maxAge = this.authService.cookieMaxAgeMs(result.access_token);
      res.cookie(ACCESS_TOKEN_COOKIE, result.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge,
        secure: process.env.NODE_ENV === 'production',
      });
      return res.redirect(302, '/admin');
    } catch {
      return res.redirect(302, '/login?error=credentials');
    }
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/', sameSite: 'lax' });
    return res.redirect(302, '/login');
  }

  @Get('admin')
  async adminGet(@Req() req: Request, @Res() res: Response) {
    const user = this.sessionUser(req);
    if (!user || user.role !== 'admin') {
      return res.redirect(302, '/login');
    }
    const [bookingsRaw, reviewsRaw] = await Promise.all([
      this.adminService.listBookings(100),
      this.adminService.listReviews(100),
    ]);
    const bookings = bookingsRaw.map((booking) => ({
      ...booking,
      createdAtDisplay: formatDateTimeDisplay(booking.createdAt),
    }));
    const reviews = reviewsRaw.map((review) => ({
      ...review,
      createdAtDisplay: formatDateTimeDisplay(review.createdAt),
    }));
    return res.render('admin', {
      title: 'Админ-панель',
      userLogin: user.login,
      bookings,
      reviews,
    });
  }

  @Get('login.html')
  @Redirect('/login', 302)
  loginHtmlLegacy() {
    return;
  }

  @Get('admin.html')
  @Redirect('/admin', 302)
  adminHtmlLegacy() {
    return;
  }
}
