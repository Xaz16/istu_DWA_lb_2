import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../database/entities/booking.entity';
import { HallTable } from '../database/entities/hall-table.entity';
import { Hall } from '../database/entities/hall.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hall, HallTable, Booking])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
