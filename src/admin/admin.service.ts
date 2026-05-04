import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../database/entities/booking.entity';
import { Review } from '../database/entities/review.entity';

const DEFAULT_LIMIT = 100;

function formatDateOnly(dateOrString: Date | string): string {
  if (typeof dateOrString === 'string') return dateOrString.slice(0, 10);
  return dateOrString.toISOString().slice(0, 10);
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  listBookings(limit?: number) {
    const take = limit != null && limit !== 0 ? limit : DEFAULT_LIMIT;
    return this.bookingRepo
      .find({
        take,
        order: { createdAt: 'DESC', id: 'DESC' },
        relations: { table: { hall: true } },
      })
      .then((bookings) =>
        bookings.map((booking) => ({
          id: booking.id,
          visitDate: formatDateOnly(booking.visitDate),
          guestCount: booking.guestCount,
          contactName: booking.contactName,
          contactPhone: booking.contactPhone,
          contactEmail: booking.contactEmail,
          createdAt: booking.createdAt,
          tableCode: booking.table.code,
          hallName: booking.table.hall.name,
        })),
      );
  }

  listReviews(limit?: number) {
    const take = limit != null && limit !== 0 ? limit : DEFAULT_LIMIT;
    return this.reviewRepo
      .find({
        take,
        order: { createdAt: 'DESC', id: 'DESC' },
        relations: { dish: true },
      })
      .then((reviews) =>
        reviews.map((review) => ({
          id: review.id,
          authorName: review.authorName,
          body: review.body,
          photoUrl: review.photoUrl,
          createdAt: review.createdAt,
          dishId: review.dish.id,
          dishName: review.dish.name,
        })),
      );
  }

  async deleteBooking(id: number): Promise<void> {
    const result = await this.bookingRepo.delete({ id });
    if (!result.affected) {
      throw new NotFoundException({ error: 'Booking not found' });
    }
  }

  async deleteReview(id: number): Promise<void> {
    const result = await this.reviewRepo.delete({ id });
    if (!result.affected) {
      throw new NotFoundException({ error: 'Review not found' });
    }
  }
}
