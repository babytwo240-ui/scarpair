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
const collectionController = __importStar(require("../controllers/collectionController"));
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const collectionValidation_1 = require("../middleware/collectionValidation");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: Manage waste material collections between businesses and recyclers
 */
/**
 * @swagger
 * /api/collections/available:
 *   get:
 *     summary: Get available posts for collection
 *     tags: [Collections]
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of available posts
 */
router.get('/available', collectionValidation_1.validateCollectionQuery, collectionController.getAvailablePosts);
/**
 * @swagger
 * /api/collections:
 *   get:
 *     summary: Get user's collections
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [requested, approved, rejected, completed]
 *     responses:
 *       200:
 *         description: User's collections
 *       401:
 *         description: Unauthorized
 */
router.get('/', userAuthMiddleware_1.authenticateUser, collectionValidation_1.validateCollectionQuery, collectionController.getUserCollections);
/**
 * @swagger
 * /api/collections/request:
 *   post:
 *     summary: Request to collect waste materials
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wastePostId:
 *                 type: string
 *               proposedDate:
 *                 type: string
 *                 format: date-time
 *               message:
 *                 type: string
 *             required: [wastePostId]
 *     responses:
 *       201:
 *         description: Collection request created
 *       400:
 *         description: Invalid input
 */
router.post('/request', userAuthMiddleware_1.authenticateUser, rateLimiter_1.RateLimiter.middleware('createCollection'), collectionValidation_1.validateCollectionRequest, collectionController.requestCollection);
/**
 * @swagger
 * /api/collections/{id}/schedule:
 *   put:
 *     summary: Schedule collection date and time
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Collection scheduled
 */
router.put('/:id/schedule', userAuthMiddleware_1.authenticateUser, rateLimiter_1.RateLimiter.middleware('updateCollection'), collectionValidation_1.validateScheduleCollection, collectionController.scheduleCollection);
/**
 * @swagger
 * /api/collections/{id}/confirm:
 *   put:
 *     summary: Confirm collection completion
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection confirmed
 */
router.put('/:id/confirm', userAuthMiddleware_1.authenticateUser, collectionController.confirmCollection);
/**
 * @swagger
 * /api/collections/{id}/accept-materials:
 *   put:
 *     summary: Accept collected materials
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Materials accepted
 */
router.put('/:id/accept-materials', userAuthMiddleware_1.authenticateUser, collectionController.acceptMaterials);
/**
 * @swagger
 * /api/collections/{id}/approve:
 *   put:
 *     summary: Approve a collection request
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection request approved
 */
router.put('/:id/approve', userAuthMiddleware_1.authenticateUser, collectionController.approveCollectionRequest);
/**
 * @swagger
 * /api/collections/{id}/reject:
 *   put:
 *     summary: Reject a collection request
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Collection request rejected
 */
router.put('/:id/reject', userAuthMiddleware_1.authenticateUser, collectionController.rejectCollectionRequest);
/**
 * @swagger
 * /api/collections/{id}/cancel:
 *   put:
 *     summary: Cancel an approved collection
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection cancelled
 */
router.put('/:id/cancel', userAuthMiddleware_1.authenticateUser, collectionController.cancelApprovedCollection);
/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     summary: Get collection details
 *     tags: [Collections]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection details
 *       404:
 *         description: Collection not found
 */
router.get('/:id', collectionController.getCollectionDetails);
exports.default = router;
//# sourceMappingURL=collectionRoutes.js.map