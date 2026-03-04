import express from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticateUser } from '../middleware/userAuthMiddleware';

const router = express.Router();
router.post(
  '/',
  authenticateUser,
  ReviewController.createReview
);
router.get(
  '/business/:businessId',
  ReviewController.getBusinessReviews
);
router.get(
  '/business/:businessId/rating',
  ReviewController.getBusinessRating
);
router.put(
  '/:reviewId',
  authenticateUser,
  ReviewController.updateReview
);
router.delete(
  '/:reviewId',
  authenticateUser,
  ReviewController.deleteReview
);

export default router;
