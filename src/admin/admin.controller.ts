import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { JwtBearerAuthGuard } from '../auth/guards/jwt-bearer-auth.guard';
import { ListAdminQueryDto } from './dto/list-admin-query.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtBearerAuthGuard, AdminRoleGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('bookings')
  listBookings(@Query() query: ListAdminQueryDto) {
    return this.admin.listBookings(query.limit);
  }

  @Delete('bookings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBooking(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteBooking(id);
  }

  @Get('reviews')
  listReviews(@Query() query: ListAdminQueryDto) {
    return this.admin.listReviews(query.limit);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteReview(@Param('id', ParseIntPipe) id: number) {
    return this.admin.deleteReview(id);
  }
}
