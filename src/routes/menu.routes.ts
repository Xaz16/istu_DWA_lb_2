import express from 'express';
import * as menuController from '../controllers/menu.controller.js';
import { sendValidationErrors } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listDishesQueryValidators, dishIdParamValidators } from '../validators/menu.validators.js';

const router = express.Router();

router.get('/sections', asyncHandler(menuController.listSections));

router.get(
  '/dishes',
  listDishesQueryValidators,
  sendValidationErrors,
  asyncHandler(menuController.listDishes)
);

router.get(
  '/dishes/:id',
  dishIdParamValidators,
  sendValidationErrors,
  asyncHandler(menuController.getDishById)
);

export default router;
