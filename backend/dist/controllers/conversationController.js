"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationController = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const redis_1 = __importDefault(require("../config/redis"));
class ConversationController {
    static async getConversations(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            const offset = (page - 1) * limit;
            const conversations = await models_1.Conversation.findAll({
                attributes: ['id', 'participant1Id', 'participant2Id', 'lastMessageAt', 'createdAt'],
                where: {
                    [sequelize_1.Op.or]: [
                        { participant1Id: userId },
                        { participant2Id: userId }
                    ]
                },
                include: [
                    {
                        model: models_1.User,
                        as: 'participant1',
                        attributes: ['id', 'businessName', 'email']
                    },
                    {
                        model: models_1.User,
                        as: 'participant2',
                        attributes: ['id', 'businessName', 'email']
                    },
                    {
                        model: models_1.Message,
                        limit: 1,
                        order: [['createdAt', 'DESC']],
                        attributes: ['content', 'createdAt']
                    }
                ],
                order: [['lastMessageAt', 'DESC']],
                limit,
                offset
            });
            const total = await models_1.Conversation.count({
                where: {
                    [sequelize_1.Op.or]: [
                        { participant1Id: userId },
                        { participant2Id: userId }
                    ]
                }
            });
            res.status(200).json({
                message: 'Conversations retrieved',
                data: conversations,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to retrieve conversations' });
        }
    }
    static async startConversation(req, res) {
        try {
            const { participantUserId, wastePostId } = req.body;
            const userId = req.user.id;
            if (!participantUserId) {
                res.status(400).json({ error: 'participantUserId is required' });
                return;
            }
            if (userId === participantUserId) {
                res.status(400).json({ error: 'Cannot start conversation with yourself' });
                return;
            }
            const otherUser = await models_1.User.findByPk(participantUserId);
            if (!otherUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            const existingConversation = await models_1.Conversation.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        {
                            [sequelize_1.Op.and]: [
                                { participant1Id: userId },
                                { participant2Id: participantUserId }
                            ]
                        },
                        {
                            [sequelize_1.Op.and]: [
                                { participant1Id: participantUserId },
                                { participant2Id: userId }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: models_1.User,
                        as: 'participant1',
                        attributes: ['id', 'businessName', 'email']
                    },
                    {
                        model: models_1.User,
                        as: 'participant2',
                        attributes: ['id', 'businessName', 'email']
                    }
                ]
            });
            if (existingConversation) {
                res.status(200).json({
                    message: 'Conversation already exists',
                    data: existingConversation
                });
                return;
            }
            const conversation = await models_1.Conversation.create({
                participant1Id: userId,
                participant2Id: participantUserId,
                wastePostId: wastePostId || null,
                lastMessageAt: new Date()
            });
            const conversationWithParticipants = await models_1.Conversation.findByPk(conversation.id, {
                include: [
                    {
                        model: models_1.User,
                        as: 'participant1',
                        attributes: ['id', 'businessName', 'email']
                    },
                    {
                        model: models_1.User,
                        as: 'participant2',
                        attributes: ['id', 'businessName', 'email']
                    }
                ]
            });
            const cacheKey = `conv:${conversation.id}`;
            await redis_1.default.hset(cacheKey, 'id', conversation.id.toString());
            await redis_1.default.hset(cacheKey, 'p1', userId.toString());
            await redis_1.default.hset(cacheKey, 'p2', participantUserId.toString());
            await redis_1.default.expire(cacheKey, 30 * 24 * 60 * 60); // 30 days
            res.status(201).json({
                message: 'Conversation started',
                data: conversationWithParticipants
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to start conversation' });
        }
    }
    static async getConversation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const conversation = await models_1.Conversation.findByPk(id, {
                include: [
                    {
                        model: models_1.User,
                        as: 'participant1',
                        attributes: ['id', 'businessName', 'email']
                    },
                    {
                        model: models_1.User,
                        as: 'participant2',
                        attributes: ['id', 'businessName', 'email']
                    },
                    {
                        model: models_1.WastePost,
                        as: 'wastePost',
                        attributes: ['id', 'title', 'description']
                    }
                ]
            });
            if (!conversation) {
                res.status(404).json({ error: 'Conversation not found' });
                return;
            }
            const isParticipant = conversation.participant1Id === userId || conversation.participant2Id === userId;
            if (!isParticipant) {
                res.status(403).json({ error: 'Not authorized to view this conversation' });
                return;
            }
            res.status(200).json({
                message: 'Conversation details',
                data: conversation
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to retrieve conversation' });
        }
    }
    static async deleteConversation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const conversation = await models_1.Conversation.findByPk(id);
            if (!conversation) {
                res.status(404).json({ error: 'Conversation not found' });
                return;
            }
            const isParticipant = conversation.participant1Id === userId || conversation.participant2Id === userId;
            if (!isParticipant) {
                res.status(403).json({ error: 'Not authorized to delete this conversation' });
                return;
            }
            await conversation.destroy();
            await redis_1.default.del(`conv:${id}`);
            await redis_1.default.del(`conversation:${id}:messages`);
            await redis_1.default.del(`typing:${id}`);
            res.status(200).json({
                message: 'Conversation deleted'
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete conversation' });
        }
    }
}
exports.ConversationController = ConversationController;
exports.default = ConversationController;
//# sourceMappingURL=conversationController.js.map