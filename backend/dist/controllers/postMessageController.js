"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMessageController = void 0;
const models_1 = require("../models");
exports.PostMessageController = {
    sendMessage: async (req, res) => {
        try {
            const { postId, subject, message } = req.body;
            const senderId = req.user?.id;
            if (!senderId) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            if (!postId || !subject || !message) {
                return res.status(400).json({ message: 'Missing required fields: postId, subject, message' });
            }
            const post = await models_1.WastePost.findByPk(postId);
            if (!post) {
                return res.status(404).json({ message: 'Waste post not found' });
            }
            const recipientId = post.businessId;
            if (senderId === recipientId) {
                return res.status(400).json({ message: 'Cannot message your own post' });
            }
            const postMessage = await models_1.PostMessage.create({
                postId,
                senderId,
                recipientId,
                subject,
                message,
                isRead: false
            });
            res.status(201).json({
                message: 'Message sent successfully',
                data: postMessage
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error sending message', error: error.message });
        }
    },
    getPostMessages: async (req, res) => {
        try {
            const { postId } = req.params;
            const userId = req.user?.id;
            const { page = 1, limit = 20 } = req.query;
            if (!userId) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
            const offset = (pageNum - 1) * limitNum;
            const post = await models_1.WastePost.findByPk(postId);
            if (!post || post.businessId !== userId) {
                return res.status(403).json({ message: 'You can only view messages for your own posts' });
            }
            const { count, rows } = await models_1.PostMessage.findAndCountAll({
                where: { postId },
                include: [
                    {
                        model: models_1.User,
                        as: 'sender',
                        attributes: ['id', 'businessName', 'email', 'phone']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: limitNum,
                offset,
                raw: false
            });
            const totalPages = Math.ceil(count / limitNum);
            res.status(200).json({
                message: 'Post messages retrieved',
                data: rows,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems: count,
                    itemsPerPage: limitNum
                }
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error retrieving messages', error: error.message });
        }
    },
    getInbox: async (req, res) => {
        try {
            const userId = req.user?.id;
            const { page = 1, limit = 20, unread = false } = req.query;
            if (!userId) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
            const offset = (pageNum - 1) * limitNum;
            const where = { recipientId: userId };
            if (unread === 'true') {
                where.isRead = false;
            }
            const { count, rows } = await models_1.PostMessage.findAndCountAll({
                where,
                include: [
                    {
                        model: models_1.User,
                        as: 'sender',
                        attributes: ['id', 'businessName', 'email', 'phone']
                    },
                    {
                        model: models_1.WastePost,
                        as: 'post',
                        attributes: ['id', 'title', 'wasteType', 'city']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: limitNum,
                offset,
                raw: false
            });
            const totalPages = Math.ceil(count / limitNum);
            if (unread !== 'true' && rows.length > 0) {
                await models_1.PostMessage.update({ isRead: true }, { where: { id: rows.map((m) => m.id), isRead: false } });
            }
            res.status(200).json({
                message: 'Inbox retrieved',
                data: rows,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems: count,
                    itemsPerPage: limitNum
                }
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error retrieving inbox', error: error.message });
        }
    },
    markAsRead: async (req, res) => {
        try {
            const { messageId } = req.params;
            const userId = req.user?.id;
            const message = await models_1.PostMessage.findByPk(messageId);
            if (!message) {
                return res.status(404).json({ message: 'Message not found' });
            }
            if (message.recipientId !== userId) {
                return res.status(403).json({ message: 'You can only mark your own messages as read' });
            }
            await message.update({ isRead: true });
            res.status(200).json({
                message: 'Message marked as read',
                data: message
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error marking message as read', error: error.message });
        }
    },
    deleteMessage: async (req, res) => {
        try {
            const { messageId } = req.params;
            const userId = req.user?.id;
            const message = await models_1.PostMessage.findByPk(messageId);
            if (!message) {
                return res.status(404).json({ message: 'Message not found' });
            }
            if (message.recipientId !== userId && message.senderId !== userId) {
                return res.status(403).json({ message: 'You can only delete your own messages' });
            }
            await message.destroy();
            res.status(200).json({ message: 'Message deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error deleting message', error: error.message });
        }
    }
};
//# sourceMappingURL=postMessageController.js.map