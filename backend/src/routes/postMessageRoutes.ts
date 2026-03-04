import express from 'express';
import { PostMessageController } from '../controllers/postMessageController';
import { authenticateUser } from '../middleware/userAuthMiddleware';

const router = express.Router();

router.use(authenticateUser);
router.post(
  '/',
  PostMessageController.sendMessage
);
router.get(
  '/post/:postId',
  PostMessageController.getPostMessages
);
router.get(
  '/inbox',
  PostMessageController.getInbox
);
router.put(
  '/:messageId/read',
  PostMessageController.markAsRead
);
router.delete(
  '/:messageId',
  PostMessageController.deleteMessage
);

export default router;
