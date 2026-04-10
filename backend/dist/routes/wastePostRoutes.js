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
const wastePostController = __importStar(require("../controllers/wastePostController"));
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const wastePostValidation_1 = require("../middleware/wastePostValidation");
const router = express_1.default.Router();
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
router.post('/', userAuthMiddleware_1.authenticateUser, rateLimiter_1.RateLimiter.middleware('createWastePost'), wastePostValidation_1.validateCreateWastePost, wastePostController.createWastePost);
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
router.get('/user/mine', userAuthMiddleware_1.authenticateUser, wastePostController.getUserWastePosts);
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
router.get('/my-approved', userAuthMiddleware_1.authenticateUser, wastePostController.getMyApprovedCollections);
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
router.post('/:id/approve-recycler', userAuthMiddleware_1.authenticateUser, wastePostController.approveRecycler);
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
router.post('/:id/cancel-approval', userAuthMiddleware_1.authenticateUser, wastePostController.cancelApproval);
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
router.post('/:id/mark-pickup', userAuthMiddleware_1.authenticateUser, wastePostController.markAsPickedUp);
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
router.get('/nearby', wastePostValidation_1.validateSearchFilters, wastePostController.getNearbyMaterials);
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
router.get('/search', wastePostValidation_1.validateSearchFilters, wastePostController.searchMaterials);
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
router.get('/filter', wastePostValidation_1.validateSearchFilters, wastePostController.filterMaterials);
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
router.put('/:id', userAuthMiddleware_1.authenticateUser, rateLimiter_1.RateLimiter.middleware('updateWastePost'), wastePostValidation_1.validateUpdateWastePost, wastePostController.updateWastePost);
router.delete('/:id', userAuthMiddleware_1.authenticateUser, wastePostController.deleteWastePost);
exports.default = router;
//# sourceMappingURL=wastePostRoutes.js.map