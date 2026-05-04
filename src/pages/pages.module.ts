import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { PagesController } from './pages.controller';

@Module({
  imports: [AuthModule, AdminModule],
  controllers: [PagesController],
})
export class PagesModule {}
