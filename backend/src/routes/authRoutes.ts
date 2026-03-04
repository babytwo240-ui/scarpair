import express from 'express';
import * as userAuthController from '../controllers/userAuthController';
import { authenticateUser } from '../middleware/userAuthMiddleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * /api/auth/business/signup:
 *   post:
 *     summary: Register a new business user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               businessName:
 *                 type: string
 *               phone:
 *                 type: string
 *             required: [email, password, businessName, phone]
 *     responses:
 *       201:
 *         description: Business user registered successfully
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Server error
 */
router.post('/business/signup', userAuthController.businessSignup);

/**
 * @swagger
 * /api/auth/recycler/signup:
 *   post:
 *     summary: Register a new recycler user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               companyName:
 *                 type: string
 *               specialization:
 *                 type: string
 *               phone:
 *                 type: string
 *             required: [email, password, companyName, phone]
 *     responses:
 *       201:
 *         description: Recycler user registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/recycler/signup', userAuthController.recyclerSignup);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email with verification code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *             required: [email, code]
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired verification code
 *       404:
 *         description: User not found
 */
router.post('/verify-email', userAuthController.verifyEmail);

/**
 * @swagger
 * /api/auth/business/login:
 *   post:
 *     summary: Login for business users
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/business/login', userAuthController.businessLogin);

/**
 * @swagger
 * /api/auth/recycler/login:
 *   post:
 *     summary: Login for recycler users
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/recycler/login', userAuthController.recyclerLogin);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.post('/logout', authenticateUser, userAuthController.logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required: [email]
 *     responses:
 *       200:
 *         description: Password reset link sent to email
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', userAuthController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *             required: [token, newPassword]
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
router.post('/reset-password', userAuthController.resetPassword);

/**
 * @swagger
 * /api/auth/debug/emails:
 *   get:
 *     summary: Get debug emails (development only)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: List of test emails
 */
router.get('/debug/emails', userAuthController.getDebugEmails);

export default router;
