"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postMessageController_1 = require("../controllers/postMessageController");
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const router = express_1.default.Router();
router.use(userAuthMiddleware_1.authenticateUser);
router.post('/', postMessageController_1.PostMessageController.sendMessage);
router.get('/post/:postId', postMessageController_1.PostMessageController.getPostMessages);
router.get('/inbox', postMessageController_1.PostMessageController.getInbox);
router.put('/:messageId/read', postMessageController_1.PostMessageController.markAsRead);
router.delete('/:messageId', postMessageController_1.PostMessageController.deleteMessage);
exports.default = router;
//# sourceMappingURL=postMessageRoutes.js.map