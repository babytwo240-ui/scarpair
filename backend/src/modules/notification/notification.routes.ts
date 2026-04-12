import express from 'express';
import * as notificationController from './notification.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);

router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:notificationId/read', notificationController.markAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
