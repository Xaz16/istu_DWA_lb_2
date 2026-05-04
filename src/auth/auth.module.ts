import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtBearerAuthGuard } from './guards/jwt-bearer-auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtBearerAuthGuard, AdminRoleGuard],
  exports: [AuthService, JwtAuthGuard, JwtBearerAuthGuard, AdminRoleGuard],
})
export class AuthModule {}
