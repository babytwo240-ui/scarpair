import express from 'express';
import * as authController from './auth.controller';
import { RateLimiter } from '../../middleware/rateLimiter';

const router = express.Router();

router.post('/business/signup', RateLimiter.middleware('register'), authController.businessSignup);
router.post('/recycler/signup', RateLimiter.middleware('register'), authController.recyclerSignup);
router.post('/verify-email', authController.verifyEmail);
router.post('/business/login', RateLimiter.middleware('login'), authController.businessLogin);
router.post('/recycler/login', RateLimiter.middleware('login'), authController.recyclerLogin);
router.post('/forgot-password', RateLimiter.middleware('register'), authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);

export default router;
