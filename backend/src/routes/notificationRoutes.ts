import { Router, Request, Response, NextFunction } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateUser } from '../middleware/userAuthMiddleware';
import { RateLimiter } from '../middleware/rateLimiter';

const router = Router();

const verifyAdminKey = (req: Request, res: Response, next: NextFunction): any => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_NOTIFICATION_KEY || 'admin-secret';

  if (adminKey !== expectedKey) {
    return res.status(403).json({ error: 'Unauthorized: Invalid admin key' });
  }
  next();
};
router.post('/admin/create', verifyAdminKey, NotificationController.createNotificationAdmin);
router.use(authenticateUser);
router.get(
  '/',
  RateLimiter.middleware('getNotifications'),
  NotificationController.getNotifications
);
router.get(
  '/unread-count',
  NotificationController.getUnreadCount
);
router.put(
  '/:id/read',
  NotificationController.markAsRead
);
router.put(
  '/read-all',
  NotificationController.markAllAsRead
);
router.delete(
  '/:id',
  NotificationController.deleteNotification
);
router.delete(
  '/delete-all',
  NotificationController.deleteAllNotifications
);

export default router;
