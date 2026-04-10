import express from 'express';
import * as collectionController from '../controllers/collectionController';
import { authenticateUser } from '../middleware/userAuthMiddleware';
import { RateLimiter } from '../middleware/rateLimiter';
import { validateCollectionRequest, validateScheduleCollection, validateCollectionQuery } from '../middleware/collectionValidation';

const router = express.Router();

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
router.get('/available', validateCollectionQuery, collectionController.getAvailablePosts);

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
router.get('/', authenticateUser, validateCollectionQuery, collectionController.getUserCollections);

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
router.post('/request', authenticateUser, RateLimiter.middleware('createCollection'), validateCollectionRequest, collectionController.requestCollection);

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
router.put('/:id/schedule', authenticateUser, RateLimiter.middleware('updateCollection'), validateScheduleCollection, collectionController.scheduleCollection);

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
router.put('/:id/confirm', authenticateUser, collectionController.confirmCollection);

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
router.put('/:id/accept-materials', authenticateUser, collectionController.acceptMaterials);

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
router.put('/:id/approve', authenticateUser, collectionController.approveCollectionRequest);

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
router.put('/:id/reject', authenticateUser, collectionController.rejectCollectionRequest);

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
router.put('/:id/cancel', authenticateUser, collectionController.cancelApprovedCollection);

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

export default router;
