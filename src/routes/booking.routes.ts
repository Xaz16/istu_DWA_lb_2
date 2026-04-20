import express from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { sendValidationErrors } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  hallTablesQueryValidators,
  createBookingBodyValidators,
} from '../validators/booking.validators.js';

const router = express.Router();

router.get('/halls', asyncHandler(bookingController.listHalls));

router.get(
  '/halls/:hallId/tables',
  hallTablesQueryValidators,
  sendValidationErrors,
  asyncHandler(bookingController.listHallTables)
);

router.post(
  '/bookings',
  createBookingBodyValidators,
  sendValidationErrors,
  asyncHandler(bookingController.createBooking)
);

export default router;
