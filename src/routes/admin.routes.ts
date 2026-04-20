import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { sendValidationErrors } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { optionalLimitQuery } from '../validators/common.validators.js';

const router = express.Router();

router.get(
  '/admin/bookings',
  requireAuth,
  requireAdmin,
  optionalLimitQuery,
  sendValidationErrors,
  asyncHandler(adminController.listBookings)
);

router.get(
  '/admin/reviews',
  requireAuth,
  requireAdmin,
  optionalLimitQuery,
  sendValidationErrors,
  asyncHandler(adminController.listReviews)
);

export default router;
