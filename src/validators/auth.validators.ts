import { body, type ValidationChain } from 'express-validator';

export const loginBodyValidators: ValidationChain[] = [
  body('login').trim().notEmpty().isLength({ max: 128 }).withMessage('login is required'),
  body('password').notEmpty().withMessage('password is required'),
];
