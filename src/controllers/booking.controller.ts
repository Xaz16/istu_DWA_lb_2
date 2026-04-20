import type { Request, Response } from 'express';
import { bookingRepository } from '../repositories/booking.repository.js';

export async function listHalls(_req: Request, res: Response): Promise<void> {
  const rows = await bookingRepository.listHalls();
  res.json(rows);
}

export async function listHallTables(req: Request, res: Response): Promise<void> {
  const hallId = Number(req.params.hallId);
  const visitDate = String(req.query.visitDate);
  const result = await bookingRepository.findTablesWithAvailability(hallId, visitDate);
  if (result.hallNotFound) {
    res.status(404).json({ error: 'Hall not found' });
    return;
  }
  res.json(result.tables);
}

export async function createBooking(req: Request, res: Response): Promise<void> {
  const body = req.body as {
    tableId: number;
    visitDate: string;
    guestCount: number;
    contactName: string;
    contactPhone: string;
    contactEmail?: string | null;
  };
  const { tableId, visitDate, guestCount, contactName, contactPhone, contactEmail } = body;
  const email =
    contactEmail == null || (typeof contactEmail === 'string' && contactEmail.trim() === '')
      ? null
      : String(contactEmail).trim();

  const result = await bookingRepository.createBooking({
    tableId,
    visitDateStr: visitDate,
    guestCount,
    contactName,
    contactPhone,
    contactEmail: email,
  });

  if (result.code === 'TABLE_NOT_FOUND') {
    res.status(404).json({ error: 'Table not found' });
    return;
  }
  if (result.code === 'CAPACITY') {
    res.status(400).json({
      error: 'guestCount exceeds table capacity',
      seatCount: result.seatCount,
    });
    return;
  }
  if (result.code === 'CONFLICT') {
    res.status(409).json({ error: 'This table is already booked for the selected date' });
    return;
  }

  res.status(201).json(result.booking);
}
