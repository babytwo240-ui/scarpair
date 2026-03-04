"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conversationController_1 = require("../controllers/conversationController");
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
router.post('/admin/clear-all', async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to clear conversations' });
    }
});
router.use(userAuthMiddleware_1.authenticateUser);
router.get('/', rateLimiter_1.RateLimiter.middleware('getConversations'), conversationController_1.ConversationController.getConversations);
router.post('/', rateLimiter_1.RateLimiter.middleware('createConversation'), conversationController_1.ConversationController.startConversation);
router.get('/:id', conversationController_1.ConversationController.getConversation);
router.delete('/:id', conversationController_1.ConversationController.deleteConversation);
exports.default = router;
//# sourceMappingURL=conversationRoutes.js.map