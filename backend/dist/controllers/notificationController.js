"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const models_1 = require("../models");
class NotificationController {
    static async createNotificationAdmin(req, res) {
        try {
            const { userId, type, title, message, relatedId } = req.body;
            if (!userId || !type || !title || !message) {
                res.status(400).json({ error: 'Missing required fields: userId, type, title, message' });
                return;
            }
            const notification = await models_1.Notification.create({
                userId,
                type,
                title,
                message,
                relatedId,
                read: false
            });
            console.log(`✓ Notification created by admin for user ${userId}: ${title}`);
            res.status(201).json({
                message: 'Notification created successfully',
                data: notification
            });
        }
        catch (error) {
            console.error('Create notification error:', error);
            res.status(500).json({ error: 'Failed to create notification' });
        }
    }
    static async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = (page - 1) * limit;
            const read = req.query.read;
            const whereClause = { userId };
            if (read === 'true') {
                whereClause.read = true;
            }
            else if (read === 'false') {
                whereClause.read = false;
            }
            const notifications = await models_1.Notification.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });
            const total = await models_1.Notification.count({ where: whereClause });
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
        }
        catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ error: 'Failed to retrieve notifications' });
        }
    }
    static async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;
            const unreadCount = await models_1.Notification.count({
                where: {
                    userId,
                    read: false
                }
            });
            res.status(200).json({
                message: 'Unread count',
                data: { unreadCount }
            });
        }
        catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({ error: 'Failed to get unread count' });
        }
    }
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const notification = await models_1.Notification.findByPk(id);
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
        }
        catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    }
    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.id;
            const result = await models_1.Notification.update({ read: true }, {
                where: {
                    userId,
                    read: false
                }
            });
            res.status(200).json({
                message: 'All notifications marked as read',
                data: {
                    updatedCount: result[0]
                }
            });
        }
        catch (error) {
            console.error('Mark all as read error:', error);
            res.status(500).json({ error: 'Failed to mark all notifications as read' });
        }
    }
    static async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const notification = await models_1.Notification.findByPk(id);
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
        }
        catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({ error: 'Failed to delete notification' });
        }
    }
    static async deleteAllNotifications(req, res) {
        try {
            const userId = req.user.id;
            const result = await models_1.Notification.destroy({
                where: { userId }
            });
            res.status(200).json({
                message: 'All notifications deleted',
                data: {
                    deletedCount: result
                }
            });
        }
        catch (error) {
            console.error('Delete all notifications error:', error);
            res.status(500).json({ error: 'Failed to delete all notifications' });
        }
    }
}
exports.NotificationController = NotificationController;
exports.default = NotificationController;
//# sourceMappingURL=notificationController.js.map