import express from 'express';
import * as ratingController from '../controllers/ratingController';
import { authenticateUser } from '../middleware/userAuthMiddleware';
import { authenticateAdmin } from '../middleware/adminAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);
router.get('/post/:postId', ratingController.getPostRating);
router.get('/user/:userId', ratingController.getUserRating);
router.get('/admin/users', authenticateAdmin, ratingController.getAllUserRatings);
router.get('/admin/posts', authenticateAdmin, ratingController.getAllPostRatings);

export default router;
