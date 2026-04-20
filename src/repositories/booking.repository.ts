import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { parseDateOnlyUtc } from '../utils/visitDate.js';

function formatDateOnly(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

export type HallTableMapRow = {
  id: number;
  hallId: number;
  code: string;
  posX: number;
  posY: number;
  seatCount: number;
  booked: boolean;
};

export type CreateBookingInput = {
  tableId: number;
  visitDateStr: string;
  guestCount: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
};

export type CreateBookingResult =
  | { code: 'TABLE_NOT_FOUND' }
  | { code: 'CAPACITY'; seatCount: number }
  | { code: 'CONFLICT' }
  | {
      code: 'OK';
      booking: {
        id: number;
        tableId: number;
        visitDate: string | null;
        guestCount: number;
        contactName: string;
        contactPhone: string;
        contactEmail: string | null;
        createdAt: Date;
      };
    };

class BookingRepository {
  async listHalls() {
    return prisma.hall.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, sortOrder: true },
    });
  }

  async findTablesWithAvailability(
    hallId: number,
    visitDateStr: string
  ): Promise<{ hallNotFound: true; tables: null } | { hallNotFound: false; tables: HallTableMapRow[] }> {
    const hall = await prisma.hall.findUnique({
      where: { id: hallId },
      select: { id: true },
    });
    if (!hall) {
      return { hallNotFound: true, tables: null };
    }

    const visitDate = parseDateOnlyUtc(visitDateStr);

    const tables = await prisma.hallTable.findMany({
      where: { hallId },
      orderBy: [{ code: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        hallId: true,
        code: true,
        posX: true,
        posY: true,
        seatCount: true,
        bookings: {
          where: { visitDate },
          select: { id: true },
          take: 1,
        },
      },
    });

    return {
      hallNotFound: false,
      tables: tables.map((t) => ({
        id: t.id,
        hallId: t.hallId,
        code: t.code,
        posX: t.posX,
        posY: t.posY,
        seatCount: t.seatCount,
        booked: t.bookings.length > 0,
      })),
    };
  }

  async createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
    const visitDate = parseDateOnlyUtc(input.visitDateStr);

    return prisma.$transaction(async (tx) => {
      const table = await tx.hallTable.findUnique({
        where: { id: input.tableId },
        select: { id: true, seatCount: true },
      });
      if (!table) {
        return { code: 'TABLE_NOT_FOUND' };
      }
      if (input.guestCount > table.seatCount) {
        return { code: 'CAPACITY', seatCount: table.seatCount };
      }

      try {
        const booking = await tx.booking.create({
          data: {
            tableId: input.tableId,
            visitDate,
            guestCount: input.guestCount,
            contactName: input.contactName,
            contactPhone: input.contactPhone,
            contactEmail: input.contactEmail,
          },
        });
        return {
          code: 'OK',
          booking: {
            id: booking.id,
            tableId: booking.tableId,
            visitDate: formatDateOnly(booking.visitDate),
            guestCount: booking.guestCount,
            contactName: booking.contactName,
            contactPhone: booking.contactPhone,
            contactEmail: booking.contactEmail,
            createdAt: booking.createdAt,
          },
        };
      } catch (e: unknown) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          return { code: 'CONFLICT' };
        }
        throw e;
      }
    });
  }
}

export const bookingRepository = new BookingRepository();
