import { Router } from 'express';
import { ConversationController } from '../controllers/conversationController';
import { authenticateUser } from '../middleware/userAuthMiddleware';
import { RateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/admin/clear-all',
  async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      res.status(403).json({ error: 'Not available in production' });
      return;
    }

    try {
      const { Conversation, Message } = require('../models');
      
      await Message.destroy({ where: {} });
      
      await Conversation.destroy({ where: {} });
      
      res.status(200).json({
        message: 'All test conversations cleared successfully',
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear conversations' });
    }
  }
);
router.use(authenticateUser);
router.get(
  '/',
  RateLimiter.middleware('getConversations'),
  ConversationController.getConversations
);

router.post(
  '/',
  RateLimiter.middleware('createConversation'),
  ConversationController.startConversation
);

router.get(
  '/:id',
  ConversationController.getConversation
);

router.delete(
  '/:id',
  ConversationController.deleteConversation
);

export default router;

