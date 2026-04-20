import { body, type ValidationChain } from 'express-validator';
import { paramPositiveInt, optionalContactEmail } from './common.validators.js';
import { visitDateQuery, visitDateBody } from './visitDate.validators.js';

export const hallTablesQueryValidators: ValidationChain[] = [
  paramPositiveInt('hallId'),
  visitDateQuery('visitDate'),
];

export const createBookingBodyValidators: ValidationChain[] = [
  body('tableId').isInt({ min: 1 }).toInt(),
  visitDateBody('visitDate'),
  body('guestCount').isInt({ min: 1 }).toInt(),
  body('contactName').trim().isLength({ min: 1, max: 255 }),
  body('contactPhone').trim().isLength({ min: 5, max: 64 }),
  optionalContactEmail('contactEmail'),
];
