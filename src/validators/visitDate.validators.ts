import { query, body, type ValidationChain } from 'express-validator';
import { isValidCalendarDateString, visitDateNotInPastString } from '../utils/visitDate.js';

export function visitDateQuery(fieldName = 'visitDate'): ValidationChain {
  return query(fieldName)
    .notEmpty()
    .withMessage('visitDate is required')
    .custom((v: unknown) => isValidCalendarDateString(v))
    .withMessage('visitDate must be a valid YYYY-MM-DD')
    .custom((v: unknown) => visitDateNotInPastString(v))
    .withMessage('visitDate cannot be in the past');
}

export function visitDateBody(fieldName = 'visitDate'): ValidationChain {
  return body(fieldName)
    .notEmpty()
    .withMessage('visitDate is required')
    .custom((v: unknown) => isValidCalendarDateString(v))
    .withMessage('visitDate must be a valid YYYY-MM-DD')
    .custom((v: unknown) => visitDateNotInPastString(v))
    .withMessage('visitDate cannot be in the past');
}
