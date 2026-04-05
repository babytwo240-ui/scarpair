import express from 'express';
import * as wastePostController from '../controllers/wastePostController';
import { authenticateUser } from '../middleware/userAuthMiddleware';
import { RateLimiter } from '../middleware/rateLimiter';
import { validateCreateWastePost, validateUpdateWastePost, validateSearchFilters } from '../middleware/wastePostValidation';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Waste Posts
 *   description: Manage waste/recyclable material posts
 */

/**
 * @swagger
 * /api/waste-posts/categories:
 *   get:
 *     summary: Get all waste material categories
 *     tags: [Waste Posts]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/categories', wastePostController.getWasteCategories);

/**
 * @swagger
 * /api/waste-posts:
 *   post:
 *     summary: Create a new waste post
 *     tags: [Waste Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               materialType:
 *                 type: string
 *               quantity:
 *                 type: number
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *             required: [materialType, quantity, description]
 *     responses:
 *       201:
 *         description: Waste post created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateUser, RateLimiter.middleware('createWastePost'), validateCreateWastePost, wastePostController.createWastePost);

/**
 * @swagger
 * /api/waste-posts/user/mine:
 *   get:
 *     summary: Get current user's waste posts
 *     tags: [Waste Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's waste posts
 *       401:
 *         description: Unauthorized
 */
router.get('/user/mine', authenticateUser, wastePostController.getUserWastePosts);

/**
 * @swagger
 * /api/waste-posts/my-approved:
 *   get:
 *     summary: Get approved collections for user
 *     tags: [Waste Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of approved collections
 */
router.get('/my-approved', authenticateUser, wastePostController.getMyApprovedCollections);

/**
 * @swagger
 * /api/waste-posts/{id}/approve-recycler:
 *   post:
 *     summary: Approve a recycler for waste collection
 *     tags: [Waste Posts]
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
 *               recyclerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recycler approved successfully
 */
router.post('/:id/approve-recycler', authenticateUser, wastePostController.approveRecycler);

/**
 * @swagger
 * /api/waste-posts/{id}/cancel-approval:
 *   post:
 *     summary: Cancel recycler approval
 *     tags: [Waste Posts]
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
 *         description: Approval cancelled successfully
 */
router.post('/:id/cancel-approval', authenticateUser, wastePostController.cancelApproval);

/**
 * @swagger
 * /api/waste-posts/{id}/mark-pickup:
 *   post:
 *     summary: Mark waste post as picked up
 *     tags: [Waste Posts]
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
 *         description: Marked as picked up
 */
router.post('/:id/mark-pickup', authenticateUser, wastePostController.markAsPickedUp);

/**
 * @swagger
 * /api/waste-posts:
 *   get:
 *     summary: Get marketplace feed of waste posts
 *     tags: [Waste Posts]
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
 *         description: List of waste posts on marketplace
 */
router.get('/', wastePostController.getMarketplaceFeed);

/**
 * @swagger
 * /api/waste-posts/nearby:
 *   get:
 *     summary: Find nearby waste materials
 *     tags: [Waste Posts]
 *     parameters:
 *       - name: latitude
 *         in: query
 *         schema:
 *           type: number
 *       - name: longitude
 *         in: query
 *         schema:
 *           type: number
 *       - name: radius
 *         in: query
 *         schema:
 *           type: number
 *           description: Radius in kilometers
 *     responses:
 *       200:
 *         description: Nearby materials
 */
router.get('/nearby', validateSearchFilters, wastePostController.getNearbyMaterials);

/**
 * @swagger
 * /api/waste-posts/search:
 *   get:
 *     summary: Search waste materials
 *     tags: [Waste Posts]
 *     parameters:
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', validateSearchFilters, wastePostController.searchMaterials);

/**
 * @swagger
 * /api/waste-posts/filter:
 *   get:
 *     summary: Filter waste materials
 *     tags: [Waste Posts]
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered results
 */
router.get('/filter', validateSearchFilters, wastePostController.filterMaterials);

/**
 * @swagger
 * /api/waste-posts/business/{businessId}/profile:
 *   get:
 *     summary: Get business profile
 *     tags: [Waste Posts]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business profile details
 */
router.get('/business/:businessId/profile', wastePostController.getBusinessProfile);

/**
 * @swagger
 * /api/waste-posts/business/{businessId}/materials:
 *   get:
 *     summary: Get materials from a business
 *     tags: [Waste Posts]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of business materials
 */
router.get('/business/:businessId/materials', wastePostController.getBusinessMaterials);

/**
 * @swagger
 * /api/waste-posts/{id}/status:
 *   get:
 *     summary: Get waste post status
 *     tags: [Waste Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post status
 */
router.get('/:id/status', wastePostController.getWastePostStatus);

/**
 * @swagger
 * /api/waste-posts/{id}:
 *   get:
 *     summary: Get waste post details
 *     tags: [Waste Posts]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Waste post details
 *       404:
 *         description: Post not found
 *   put:
 *     summary: Update a waste post
 *     tags: [Waste Posts]
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
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 *   delete:
 *     summary: Delete a waste post
 *     tags: [Waste Posts]
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
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */
router.get('/:id', wastePostController.getWastePostDetails); 
router.put('/:id', authenticateUser, RateLimiter.middleware('updateWastePost'), validateUpdateWastePost, wastePostController.updateWastePost); 
router.delete('/:id', authenticateUser, wastePostController.deleteWastePost); 

export default router;
