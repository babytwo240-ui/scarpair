"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
const verifyAdminKey = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_NOTIFICATION_KEY || 'admin-secret';
    if (adminKey !== expectedKey) {
        return res.status(403).json({ error: 'Unauthorized: Invalid admin key' });
    }
    next();
};
router.post('/admin/create', verifyAdminKey, notificationController_1.NotificationController.createNotificationAdmin);
router.use(userAuthMiddleware_1.authenticateUser);
router.get('/', rateLimiter_1.RateLimiter.middleware('getNotifications'), notificationController_1.NotificationController.getNotifications);
router.get('/unread-count', notificationController_1.NotificationController.getUnreadCount);
router.put('/:id/read', notificationController_1.NotificationController.markAsRead);
router.put('/read-all', notificationController_1.NotificationController.markAllAsRead);
router.delete('/:id', notificationController_1.NotificationController.deleteNotification);
router.delete('/delete-all', notificationController_1.NotificationController.deleteAllNotifications);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map