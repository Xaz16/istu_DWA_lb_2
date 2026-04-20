import { query, param, body, type ValidationChain } from 'express-validator';

export function paramPositiveInt(paramName: string): ValidationChain {
  return param(paramName).isInt({ min: 1 }).toInt();
}

export const optionalLimitQuery: ValidationChain[] = [
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
];

export function optionalContactEmail(fieldName = 'contactEmail'): ValidationChain {
  return body(fieldName)
    .optional({ values: 'null' })
    .custom((v: unknown) => {
      if (v == null || v === '') return true;
      if (typeof v !== 'string') return false;
      const t = v.trim();
      if (t === '') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
    })
    .withMessage('contactEmail must be a valid email or empty');
}
