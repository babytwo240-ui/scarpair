// Message Module
import { Request, Response } from 'express';
import { sequelize } from '../../models';

export const getMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const offset = (pageNum - 1) * limitNum;

    const Message = (sequelize as any).models.Message;
    const User = (sequelize as any).models.User;

    const { count, rows } = await Message.findAndCountAll({
      where: { conversationId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'email'] }],
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Messages retrieved',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ error: 'conversationId and text are required' });
    }

    const Message = (sequelize as any).models.Message;

    const message = await Message.create({
      conversationId,
      senderId: userId,
      text,
      isRead: false
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const markMessageAsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const { messageId } = req.params;

    const Message = (sequelize as any).models.Message;
    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      message: 'Message marked as read',
      data: message
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to mark message' });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;

    const Message = (sequelize as any).models.Message;
    const message = await Message.findByPk(messageId);

    if (!message || message.senderId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await message.destroy();

    res.status(200).json({
      message: 'Message deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
