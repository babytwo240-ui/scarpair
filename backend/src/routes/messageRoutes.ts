import { Router } from 'express';
import { MessageController } from '../controllers/messageController';
import { authenticateUser } from '../middleware/userAuthMiddleware';
import { RateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticateUser);
router.post(
  '/',
  RateLimiter.middleware('sendMessage'),
  MessageController.sendMessage
);
router.get(
  '/:conversationId',
  RateLimiter.middleware('getMessages'),
  MessageController.getMessages
);
router.put(
  '/:id',
  MessageController.editMessage
);
router.delete(
  '/:id',
  MessageController.deleteMessage
);

export default router;
