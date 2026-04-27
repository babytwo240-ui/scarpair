import { Request, Response } from 'express';
import { Notification } from '../models';

export class NotificationController {
  static async createNotificationAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, title, message, relatedId } = req.body;

      if (!userId || !type || !title || !message) {
        res.status(400).json({ error: 'Missing required fields: userId, type, title, message' });
        return;
      }

      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        relatedId,
        read: false
      });
      res.status(201).json({
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }

  static async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;
      const read = req.query.read as string; 

      const whereClause: any = { userId };
      if (read === 'true') {
        whereClause.read = true;
      } else if (read === 'false') {
        whereClause.read = false;
      }

      const notifications = await Notification.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      const total = await Notification.count({ where: whereClause });

      res.status(200).json({
        message: 'Notifications retrieved',
        data: notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve notifications' });
    }
  }

  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const unreadCount = await Notification.count({
        where: {
          userId,
          read: false
        }
      });

      res.status(200).json({
        message: 'Unread count',
        data: { unreadCount }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }

  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const notification = await Notification.findByPk(id);
      if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      if (notification.userId !== userId) {
        res.status(403).json({ error: 'Not authorized to update this notification' });
        return;
      }

      await notification.update({ read: true });

      res.status(200).json({
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const result = await Notification.update(
        { read: true },
        {
          where: {
            userId,
            read: false
          }
        }
      );

      res.status(200).json({
        message: 'All notifications marked as read',
        data: {
          updatedCount: result[0]
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const notification = await Notification.findByPk(id);
      if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      if (notification.userId !== userId) {
        res.status(403).json({ error: 'Not authorized to delete this notification' });
        return;
      }

      await notification.destroy();

      res.status(200).json({
        message: 'Notification deleted'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }

  static async deleteAllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      const result = await Notification.destroy({
        where: { userId }
      });

      res.status(200).json({
        message: 'All notifications deleted',
        data: {
          deletedCount: result
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete all notifications' });
    }
  }
}

export default NotificationController;

