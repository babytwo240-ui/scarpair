import { Request, Response } from 'express';
import { Conversation, User, Message, WastePost } from '../models';
import { Op } from 'sequelize';
import redisClient from '../config/redis';

export class ConversationController {
  static async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;

      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        },
        include: [
          {
            model: User,
            as: 'participant1',
            attributes: ['id', 'businessName', 'email']
          },
          {
            model: User,
            as: 'participant2',
            attributes: ['id', 'businessName', 'email']
          },
          {
            model: Message,
            limit: 1,
            order: [['createdAt', 'DESC']],
            attributes: ['content', 'createdAt']
          }
        ],
        order: [['lastMessageAt', 'DESC']],
        limit,
        offset
      });

      const total = await Conversation.count({
        where: {
          [Op.or]: [
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
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve conversations' });
    }
  }

  static async startConversation(req: Request, res: Response): Promise<void> {
    try {
      const { participantUserId, wastePostId } = req.body;
      const userId = (req as any).user.id;

      if (!participantUserId) {
        res.status(400).json({ error: 'participantUserId is required' });
        return;
      }

      if (userId === participantUserId) {
        res.status(400).json({ error: 'Cannot start conversation with yourself' });
        return;
      }

      const otherUser = await User.findByPk(participantUserId);
      if (!otherUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const existingConversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                { participant1Id: userId },
                { participant2Id: participantUserId }
              ]
            },
            {
              [Op.and]: [
                { participant1Id: participantUserId },
                { participant2Id: userId }
              ]
            }
          ]
        },
        include: [
          {
            model: User,
            as: 'participant1',
            attributes: ['id', 'businessName', 'email']
          },
          {
            model: User,
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

      const conversation = await Conversation.create({
        participant1Id: userId,
        participant2Id: participantUserId,
        wastePostId: wastePostId || null,
        lastMessageAt: new Date()
      });

      const conversationWithParticipants = await Conversation.findByPk(conversation.id, {
        include: [
          {
            model: User,
            as: 'participant1',
            attributes: ['id', 'businessName', 'email']
          },
          {
            model: User,
            as: 'participant2',
            attributes: ['id', 'businessName', 'email']
          }
        ]
      });

      const cacheKey = `conv:${conversation.id}`;
      await redisClient.hset(cacheKey, 'id', conversation.id.toString());
      await redisClient.hset(cacheKey, 'p1', userId.toString());
      await redisClient.hset(cacheKey, 'p2', participantUserId.toString());
      await redisClient.expire(cacheKey, 30 * 24 * 60 * 60); // 30 days

      res.status(201).json({
        message: 'Conversation started',
        data: conversationWithParticipants
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start conversation' });
    }
  }

  static async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const conversation = await Conversation.findByPk(id, {
        include: [
          {
            model: User,
            as: 'participant1',
            attributes: ['id', 'businessName', 'email']
          },
          {
            model: User,
            as: 'participant2',
            attributes: ['id', 'businessName', 'email']
          },
          {
            model: WastePost,
            as: 'wastePost',
            attributes: ['id', 'title', 'description']
          }
        ]
      });

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      const isParticipant =
        conversation.participant1Id === userId || conversation.participant2Id === userId;
      if (!isParticipant) {
        res.status(403).json({ error: 'Not authorized to view this conversation' });
        return;
      }

      res.status(200).json({
        message: 'Conversation details',
        data: conversation
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve conversation' });
    }
  }

  static async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const conversation = await Conversation.findByPk(id);
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      const isParticipant =
        conversation.participant1Id === userId || conversation.participant2Id === userId;
      if (!isParticipant) {
        res.status(403).json({ error: 'Not authorized to delete this conversation' });
        return;
      }

      await conversation.destroy();

      await redisClient.del(`conv:${id}`);
      await redisClient.del(`conversation:${id}:messages`);
      await redisClient.del(`typing:${id}`);

      res.status(200).json({
        message: 'Conversation deleted'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  }
}

export default ConversationController;

