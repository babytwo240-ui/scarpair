"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuthController = __importStar(require("../controllers/userAuthController"));
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
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
router.post('/business/signup', rateLimiter_1.RateLimiter.middleware('register'), userAuthController.businessSignup);
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
router.post('/recycler/signup', rateLimiter_1.RateLimiter.middleware('register'), userAuthController.recyclerSignup);
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
router.post('/business/login', rateLimiter_1.RateLimiter.middleware('login'), userAuthController.businessLogin);
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
router.post('/recycler/login', rateLimiter_1.RateLimiter.middleware('login'), userAuthController.recyclerLogin);
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
router.post('/logout', userAuthMiddleware_1.authenticateUser, userAuthController.logout);
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
router.post('/forgot-password', rateLimiter_1.RateLimiter.middleware('passwordReset'), userAuthController.forgotPassword);
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
router.post('/reset-password', rateLimiter_1.RateLimiter.middleware('passwordReset'), userAuthController.resetPassword);
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
exports.default = router;
//# sourceMappingURL=authRoutes.js.map