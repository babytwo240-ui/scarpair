"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const models_1 = require("../models");
class NotificationService {
    static async createNotification(data) {
        try {
            const notification = await models_1.Notification.create({
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                relatedId: data.relatedId,
                read: false
            });
            console.log(`✓ Notification created for user ${data.userId}: ${data.title}`);
            return notification;
        }
        catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }
    static async createBulkNotifications(userIds, data) {
        try {
            const notifications = await Promise.all(userIds.map(userId => models_1.Notification.create({
                userId,
                type: data.type,
                title: data.title,
                message: data.message,
                relatedId: data.relatedId,
                read: false
            })));
            console.log(`✓ Bulk notifications created for ${userIds.length} users: ${data.title}`);
            return notifications;
        }
        catch (error) {
            console.error('Error creating bulk notifications:', error);
            throw error;
        }
    }
    static async notifyUserVerified(userId) {
        return this.createNotification({
            userId,
            type: 'VERIFICATION',
            title: 'Account Verified',
            message: 'Your account has been verified by the admin. You can now post materials and waste.'
        });
    }
    static async notifyUserUnverified(userId) {
        return this.createNotification({
            userId,
            type: 'VERIFICATION',
            title: 'Account Unverified',
            message: 'Your account verification has been removed by the admin.'
        });
    }
    static async notifyMaterialPosted(businessUserId, materialId, materialType) {
        return this.createNotification({
            userId: businessUserId,
            type: 'MATERIAL_POSTED',
            title: 'Material Posted Successfully',
            message: `Your ${materialType} material has been posted and is now available for recyclers to view.`,
            relatedId: materialId
        });
    }
    static async notifyRecyclersNewMaterial(recyclerIds, materialType) {
        if (recyclerIds.length === 0)
            return [];
        return this.createBulkNotifications(recyclerIds, {
            type: 'MATERIAL_POSTED',
            title: `New ${materialType} Available`,
            message: `A business has posted new ${materialType} material. Check it out!`
        });
    }
    static async notifyCollectionRequest(targetUserId, requesterName, collectionId) {
        return this.createNotification({
            userId: targetUserId,
            type: 'COLLECTION_REQUEST',
            title: 'New Collection Request',
            message: `${requesterName} has requested to collect materials from you.`,
            relatedId: collectionId
        });
    }
    static async notifyNewMessage(recipientId, senderName, messageId) {
        return this.createNotification({
            userId: recipientId,
            type: 'MESSAGE',
            title: 'New Message',
            message: `You received a new message from ${senderName}.`,
            relatedId: messageId
        });
    }
    static async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
        try {
            const where = { userId };
            if (unreadOnly) {
                where.read = false;
            }
            const notifications = await models_1.Notification.findAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: Math.min(limit, 100),
                offset: (page - 1) * limit
            });
            const total = await models_1.Notification.count({ where });
            return { notifications, total };
        }
        catch (error) {
            console.error('Error getting user notifications:', error);
            throw error;
        }
    }
    static async getUnreadCount(userId) {
        try {
            const count = await models_1.Notification.count({
                where: {
                    userId,
                    read: false
                }
            });
            return count;
        }
        catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
//# sourceMappingURL=notificationService.js.map