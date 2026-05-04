import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Equal, In, QueryFailedError, Repository } from 'typeorm';
import { Booking } from '../database/entities/booking.entity';
import { HallTable } from '../database/entities/hall-table.entity';
import { Hall } from '../database/entities/hall.entity';
import { parseDateOnlyUtc } from '../common/visit-date';
import type { CreateBookingDto } from './dto/create-booking.dto';

function formatDateOnly(dateOrString: Date | string | null): string | null {
  if (dateOrString == null) return null;
  if (typeof dateOrString === 'string') return dateOrString.slice(0, 10);
  return dateOrString.toISOString().slice(0, 10);
}

function isPgUniqueViolation(err: unknown): boolean {
  return (
    err instanceof QueryFailedError &&
    typeof err.driverError === 'object' &&
    err.driverError !== null &&
    (err.driverError as { code?: string }).code === '23505'
  );
}

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Hall)
    private readonly hallRepo: Repository<Hall>,
    @InjectRepository(HallTable)
    private readonly hallTableRepo: Repository<HallTable>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  listHalls() {
    return this.hallRepo.find({
      order: { sortOrder: 'ASC', id: 'ASC' },
      select: { id: true, name: true, sortOrder: true },
    });
  }

  async listHallTables(hallId: number, visitDateStr: string) {
    const hall = await this.hallRepo.findOne({
      where: { id: hallId },
      select: { id: true },
    });
    if (!hall) {
      throw new NotFoundException({ error: 'Hall not found' });
    }
    const visitDate = parseDateOnlyUtc(visitDateStr);
    const tables = await this.hallTableRepo.find({
      where: { hallId },
      order: { code: 'ASC', id: 'ASC' },
    });
    const tableIds = tables.map((table) => table.id);
    const bookedIds = new Set<number>();
    if (tableIds.length > 0) {
      const rows = await this.bookingRepo.find({
        where: { tableId: In(tableIds), visitDate: Equal(visitDate) },
        select: { tableId: true },
      });
      for (const booking of rows) {
        bookedIds.add(booking.tableId);
      }
    }
    return tables.map((table) => ({
      id: table.id,
      hallId: table.hallId,
      code: table.code,
      posX: table.posX,
      posY: table.posY,
      seatCount: table.seatCount,
      booked: bookedIds.has(table.id),
    }));
  }

  async createBooking(dto: CreateBookingDto) {
    const visitDate = parseDateOnlyUtc(dto.visitDate);
    const email =
      dto.contactEmail == null || (typeof dto.contactEmail === 'string' && dto.contactEmail.trim() === '')
        ? null
        : String(dto.contactEmail).trim();

    try {
      return await this.dataSource.transaction(async (entityManager) => {
        const table = await entityManager.findOne(HallTable, {
          where: { id: dto.tableId },
          select: { id: true, seatCount: true },
        });
        if (!table) {
          throw new NotFoundException({ error: 'Table not found' });
        }
        if (dto.guestCount > table.seatCount) {
          throw new BadRequestException({
            error: 'guestCount exceeds table capacity',
            seatCount: table.seatCount,
          });
        }
        const booking = entityManager.create(Booking, {
          tableId: dto.tableId,
          visitDate,
          guestCount: dto.guestCount,
          contactName: dto.contactName,
          contactPhone: dto.contactPhone,
          contactEmail: email,
        });
        const saved = await entityManager.save(booking);
        return {
          id: saved.id,
          tableId: saved.tableId,
          visitDate: formatDateOnly(saved.visitDate),
          guestCount: saved.guestCount,
          contactName: saved.contactName,
          contactPhone: saved.contactPhone,
          contactEmail: saved.contactEmail,
          createdAt: saved.createdAt,
        };
      });
    } catch (error: unknown) {
      if (isPgUniqueViolation(error)) {
        throw new ConflictException({
          error: 'This table is already booked for the selected date',
        });
      }
      throw error;
    }
  }
}
