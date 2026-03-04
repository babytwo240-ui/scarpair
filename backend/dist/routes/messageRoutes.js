"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
router.use(userAuthMiddleware_1.authenticateUser);
router.post('/', rateLimiter_1.RateLimiter.middleware('sendMessage'), messageController_1.MessageController.sendMessage);
router.get('/:conversationId', rateLimiter_1.RateLimiter.middleware('getMessages'), messageController_1.MessageController.getMessages);
router.put('/:id', messageController_1.MessageController.editMessage);
router.delete('/:id', messageController_1.MessageController.deleteMessage);
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map