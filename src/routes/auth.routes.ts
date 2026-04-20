import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { sendValidationErrors } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginBodyValidators } from '../validators/auth.validators.js';

const router = express.Router();

router.post(
  '/auth/login',
  loginBodyValidators,
  sendValidationErrors,
  asyncHandler(authController.login)
);

router.get('/auth/me', requireAuth, authController.me);

router.post('/auth/logout', authController.logout);

export default router;
