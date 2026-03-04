"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const models_1 = require("../models");
const redis_1 = __importDefault(require("../config/redis"));
class MessageController {
    // send message
    static async sendMessage(req, res) {
        try {
            const { conversationId, recipientId, content, imageUrl } = req.body;
            const senderId = req.user.id;
            const io = req.io;
            if (!conversationId || !recipientId || !content) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            if (content.length > 5000) {
                res.status(413).json({ error: 'Message exceeds maximum length (5000 characters)' });
                return;
            }
            const conversation = await models_1.Conversation.findByPk(conversationId);
            if (!conversation) {
                res.status(404).json({ error: 'Conversation not found' });
                return;
            }
            const message = await models_1.Message.create({
                conversationId,
                senderId,
                recipientId,
                content,
                imageUrl: imageUrl || null
            });
            await conversation.update({ lastMessageAt: new Date() });
            const cacheKey = `conversation:${conversationId}:messages`;
            await redis_1.default.zadd(cacheKey, Date.now(), JSON.stringify(message.toJSON()));
            await redis_1.default.expire(cacheKey, 24 * 60 * 60);
            await models_1.Notification.create({
                userId: recipientId,
                type: 'MESSAGE',
                title: `New message from ${req.user.businessName || req.user.email}`,
                message: content.substring(0, 100),
                relatedId: message.id
            });
            const sender = await models_1.User.findByPk(senderId, {
                attributes: ['id', 'businessName', 'email']
            });
            io.to(`conversation:${conversationId}`).emit('message:received', {
                id: message.id,
                conversationId,
                sender: sender?.toJSON(),
                content,
                imageUrl: imageUrl || null,
                createdAt: message.createdAt
            });
            io.to(`user:${recipientId}`).emit('notification:new', {
                id: message.id,
                type: 'MESSAGE',
                title: `New message from ${sender?.dataValues.businessName || sender?.dataValues.email}`,
                message: content.substring(0, 100),
                relatedId: message.id
            });
            res.status(201).json({
                message: 'Message sent',
                data: {
                    id: message.id,
                    conversationId,
                    senderId,
                    recipientId,
                    content,
                    imageUrl: imageUrl || null,
                    createdAt: message.createdAt,
                    sender: sender?.toJSON()
                }
            });
        }
        catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    }
    static async getMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = (page - 1) * limit;
            const conversation = await models_1.Conversation.findByPk(conversationId);
            if (!conversation) {
                res.status(404).json({ error: 'Conversation not found' });
                return;
            }
            const cacheKey = `conversation:${conversationId}:messages`;
            let messages = [];
            let fromCache = false;
            try {
                const cachedMessages = await redis_1.default.zrange(cacheKey, 0, -1);
                if (cachedMessages.length > 0) {
                    messages = cachedMessages.map(msg => JSON.parse(msg));
                    fromCache = true;
                }
            }
            catch (error) {
                console.warn('Cache miss, querying database');
            }
            if (!fromCache) {
                messages = await models_1.Message.findAll({
                    where: { conversationId },
                    include: [
                        {
                            model: models_1.User,
                            as: 'sender',
                            attributes: ['id', 'businessName', 'email']
                        }
                    ],
                    order: [['createdAt', 'DESC']],
                    limit,
                    offset,
                    raw: false
                });
                // Cache results
                try {
                    for (const msg of messages) {
                        await redis_1.default.zadd(cacheKey, msg.createdAt.getTime(), JSON.stringify(msg.toJSON()));
                    }
                    await redis_1.default.expire(cacheKey, 24 * 60 * 60);
                }
                catch (error) {
                    console.warn('Cache write failed');
                }
            }
            // Get total count
            const total = await models_1.Message.count({ where: { conversationId } });
            res.status(200).json({
                message: 'Messages retrieved',
                data: messages,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                },
                fromCache
            });
        }
        catch (error) {
            console.error('Get messages error:', error);
            res.status(500).json({ error: 'Failed to retrieve messages' });
        }
    }
    static async editMessage(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.id;
            if (!content || content.length > 5000) {
                res.status(400).json({ error: 'Invalid content' });
                return;
            }
            const message = await models_1.Message.findByPk(id);
            if (!message) {
                res.status(404).json({ error: 'Message not found' });
                return;
            }
            if (message.senderId !== userId) {
                res.status(403).json({ error: 'Cannot edit others messages' });
                return;
            }
            await message.update({ content });
            await redis_1.default.del(`conversation:${message.conversationId}:messages`);
            res.status(200).json({
                message: 'Message updated',
                data: message
            });
        }
        catch (error) {
            console.error('Edit message error:', error);
            res.status(500).json({ error: 'Failed to update message' });
        }
    }
    static async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const message = await models_1.Message.findByPk(id);
            if (!message) {
                res.status(404).json({ error: 'Message not found' });
                return;
            }
            if (message.senderId !== userId) {
                res.status(403).json({ error: 'Cannot delete others messages' });
                return;
            }
            const conversationId = message.conversationId;
            await message.destroy();
            await redis_1.default.del(`conversation:${conversationId}:messages`);
            res.status(200).json({
                message: 'Message deleted'
            });
        }
        catch (error) {
            console.error('Delete message error:', error);
            res.status(500).json({ error: 'Failed to delete message' });
        }
    }
}
exports.MessageController = MessageController;
exports.default = MessageController;
//# sourceMappingURL=messageController.js.map