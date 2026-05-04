import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { HallTablesQueryDto } from './dto/hall-tables-query.dto';
import { BookingService } from './booking.service';

@Controller()
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Get('halls')
  listHalls() {
    return this.booking.listHalls();
  }

  @Get('halls/:hallId/tables')
  listHallTables(
    @Param('hallId', ParseIntPipe) hallId: number,
    @Query() query: HallTablesQueryDto,
  ) {
    return this.booking.listHallTables(hallId, query.visitDate);
  }

  @Post('bookings')
  @HttpCode(HttpStatus.CREATED)
  createBooking(@Body() dto: CreateBookingDto) {
    return this.booking.createBooking(dto);
  }
}
