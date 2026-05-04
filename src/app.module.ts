import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { typeOrmEntities } from './database/typeorm-entities';
import { MenuModule } from './menu/menu.module';
import { PagesModule } from './pages/pages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: typeOrmEntities,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        const isProd = config.get<string>('NODE_ENV') === 'production';
        if (isProd && !secret) {
          throw new Error('JWT_SECRET must be set in production');
        }
        const signOptions: JwtSignOptions = {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '24h') as JwtSignOptions['expiresIn'],
        };
        return {
          secret: secret ?? '123123',
          signOptions,
        };
      },
      inject: [ConfigService],
    }),
    PagesModule,
    AuthModule,
    MenuModule,
    BookingModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
