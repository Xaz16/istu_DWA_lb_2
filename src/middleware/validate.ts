import { validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

export function sendValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).json({ errors: result.array({ onlyFirstError: false }) });
    return;
  }
  next();
}
