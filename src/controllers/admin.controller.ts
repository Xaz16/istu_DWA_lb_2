import type { Request, Response } from 'express';
import { adminRepository } from '../repositories/admin.repository.js';

const DEFAULT_LIMIT = 100;

function parseLimit(raw: unknown): number {
  if (raw == null || raw === '') return DEFAULT_LIMIT;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : DEFAULT_LIMIT;
}

export async function listBookings(req: Request, res: Response): Promise<void> {
  const limit = parseLimit(req.query.limit);
  const rows = await adminRepository.listBookings(limit);
  res.json(rows);
}

export async function listReviews(req: Request, res: Response): Promise<void> {
  const limit = parseLimit(req.query.limit);
  const rows = await adminRepository.listReviews(limit);
  res.json(rows);
}
