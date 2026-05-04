import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{
    access_token: string;
    token_type: 'Bearer';
    expires_in: string;
  }> {
    const user = await this.userRepo.findOne({
      where: { login: dto.login },
      select: { id: true, login: true, password: true, role: true },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException({ error: 'Invalid login or password' });
    }
    const access_token = this.jwt.sign({
      sub: user.id,
      login: user.login,
      role: user.role,
    });
    return {
      access_token,
      token_type: 'Bearer',
      expires_in: this.config.get<string>('JWT_EXPIRES_IN') || '24h',
    };
  }

  cookieMaxAgeMs(token: string): number {
    const decoded = this.jwt.decode(token);
    if (!decoded || typeof decoded === 'string') {
      return 24 * 60 * 60 * 1000;
    }
    const exp =
      typeof decoded === 'object' && decoded && 'exp' in decoded && typeof decoded.exp === 'number'
        ? decoded.exp
        : null;
    if (exp == null) return 24 * 60 * 60 * 1000;
    return Math.max(exp * 1000 - Date.now(), 0);
  }
}
