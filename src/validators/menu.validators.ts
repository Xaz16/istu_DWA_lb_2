import { query, type ValidationChain } from 'express-validator';
import { paramPositiveInt } from './common.validators.js';

export const listDishesQueryValidators: ValidationChain[] = [
  query('sectionId').optional().isInt({ min: 1 }).toInt(),
  query('minWeight').optional().isInt({ min: 0 }).toInt(),
  query('maxWeight').optional().isInt({ min: 0 }).toInt(),
  query('minCalories').optional().isInt({ min: 0 }).toInt(),
  query('maxCalories').optional().isInt({ min: 0 }).toInt(),
  query('hasAllergens').optional().isIn(['true', 'false']),
  query('isSpicy').optional().isIn(['true', 'false']),
  query('kidFriendly').optional().isIn(['true', 'false']),
  query('q')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('q must be 1–200 characters'),
  query().custom((_, { req }) => {
    const { minWeight, maxWeight, minCalories, maxCalories } = req.query as Record<string, unknown>;
    if (minWeight != null && maxWeight != null && Number(minWeight) > Number(maxWeight)) {
      throw new Error('minWeight must be less than or equal to maxWeight');
    }
    if (minCalories != null && maxCalories != null && Number(minCalories) > Number(maxCalories)) {
      throw new Error('minCalories must be less than or equal to maxCalories');
    }
    return true;
  }),
];

export const dishIdParamValidators: ValidationChain[] = [paramPositiveInt('id')];
