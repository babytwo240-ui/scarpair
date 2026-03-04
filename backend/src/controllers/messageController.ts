import { Request, Response } from 'express';
import { Message, Conversation, User, Notification } from '../models';
import redisClient from '../config/redis';
import { Op } from 'sequelize';

export class MessageController {
// send message
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId, recipientId, content, imageUrl } = req.body;
      const senderId = (req as any).user.id;
      const io = (req as any).io;

      
      if (!conversationId || !recipientId || !content) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (content.length > 5000) {
        res.status(413).json({ error: 'Message exceeds maximum length (5000 characters)' });
        return;
      }

      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      const message = await Message.create({
        conversationId,
        senderId,
        recipientId,
        content,
        imageUrl: imageUrl || null
      });

      await conversation.update({ lastMessageAt: new Date() });

      const cacheKey = `conversation:${conversationId}:messages`;
      await redisClient.zadd(cacheKey, Date.now(), JSON.stringify(message.toJSON()));
      await redisClient.expire(cacheKey, 24 * 60 * 60); 

      await Notification.create({
        userId: recipientId,
        type: 'MESSAGE',
        title: `New message from ${(req as any).user.businessName || (req as any).user.email}`,
        message: content.substring(0, 100), 
        relatedId: message.id
      });

      const sender = await User.findByPk(senderId, {
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
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;

      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      const cacheKey = `conversation:${conversationId}:messages`;
      let messages = [];
      let fromCache = false;

      try {
        const cachedMessages = await redisClient.zrange(cacheKey, 0, -1);
        if (cachedMessages.length > 0) {
          messages = cachedMessages.map(msg => JSON.parse(msg));
          fromCache = true;
        }
      } catch (error) {
        console.warn('Cache miss, querying database');
      }

      if (!fromCache) {
        messages = await Message.findAll({
          where: { conversationId },
          include: [
            {
              model: User,
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
            await redisClient.zadd(cacheKey, msg.createdAt.getTime(), JSON.stringify(msg.toJSON()));
          }
          await redisClient.expire(cacheKey, 24 * 60 * 60);
        } catch (error) {
          console.warn('Cache write failed');
        }
      }

      // Get total count
      const total = await Message.count({ where: { conversationId } });

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
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  }

  static async editMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = (req as any).user.id;

      if (!content || content.length > 5000) {
        res.status(400).json({ error: 'Invalid content' });
        return;
      }

      const message = await Message.findByPk(id);
      if (!message) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }

      if (message.senderId !== userId) {
        res.status(403).json({ error: 'Cannot edit others messages' });
        return;
      }

      await message.update({ content });

      await redisClient.del(`conversation:${message.conversationId}:messages`);

      res.status(200).json({
        message: 'Message updated',
        data: message
      });
    } catch (error) {
      console.error('Edit message error:', error);
      res.status(500).json({ error: 'Failed to update message' });
    }
  }

  static async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const message = await Message.findByPk(id);
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

      await redisClient.del(`conversation:${conversationId}:messages`);

      res.status(200).json({
        message: 'Message deleted'
      });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }
}

export default MessageController;
