import { prisma } from '../db/prisma.js';

function formatDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

class AdminRepository {
  async listBookings(limit: number) {
    const rows = await prisma.booking.findMany({
      take: limit,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        table: {
          select: {
            code: true,
            hall: { select: { name: true } },
          },
        },
      },
    });
    return rows.map((b) => ({
      id: b.id,
      visitDate: formatDateOnly(b.visitDate),
      guestCount: b.guestCount,
      contactName: b.contactName,
      contactPhone: b.contactPhone,
      contactEmail: b.contactEmail,
      createdAt: b.createdAt,
      tableCode: b.table.code,
      hallName: b.table.hall.name,
    }));
  }

  async listReviews(limit: number) {
    const rows = await prisma.review.findMany({
      take: limit,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        dish: { select: { id: true, name: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      body: r.body,
      photoUrl: r.photoUrl,
      createdAt: r.createdAt,
      dishId: r.dish.id,
      dishName: r.dish.name,
    }));
  }
}

export const adminRepository = new AdminRepository();
