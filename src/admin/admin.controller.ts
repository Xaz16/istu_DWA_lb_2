import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListAdminQueryDto } from './dto/list-admin-query.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('bookings')
  listBookings(@Query() query: ListAdminQueryDto) {
    return this.admin.listBookings(query.limit);
  }

  @Get('reviews')
  listReviews(@Query() query: ListAdminQueryDto) {
    return this.admin.listReviews(query.limit);
  }
}
