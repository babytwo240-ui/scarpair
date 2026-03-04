import express from 'express';
import * as feedbackController from '../controllers/feedbackController';
import { authenticateUser } from '../middleware/userAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);
router.post('/', feedbackController.submitFeedback);
router.get('/user/:userId', feedbackController.getUserFeedback);
router.get('/post/:postId', feedbackController.getPostFeedback);

export default router;
