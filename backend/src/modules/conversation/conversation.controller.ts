// Conversation Module
import { Request, Response } from 'express';
import { sequelize } from '../../models';
import { Op } from 'sequelize';

export const getConversations = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const Conversation = (sequelize as any).models.Conversation;
    const User = (sequelize as any).models.User;

    const { count, rows } = await Conversation.findAndCountAll({
      where: { [Op.or]: [{ participant1Id: userId }, { participant2Id: userId }] },
      include: [
        { model: User, as: 'participant1', attributes: ['id', 'email', 'businessName', 'companyName'] },
        { model: User, as: 'participant2', attributes: ['id', 'email', 'businessName', 'companyName'] }
      ],
      limit: limitNum,
      offset,
      order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Conversations retrieved',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const createConversation = async (req: Request, res: Response): Promise<any> => {
  try {
    const participant1Id = req.user?.id;
    const { participant2Id } = req.body;

    if (!participant2Id) {
      return res.status(400).json({ error: 'participant2Id is required' });
    }

    if (participant1Id === participant2Id) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    const Conversation = (sequelize as any).models.Conversation;
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant1Id: participant1Id, participant2Id: participant2Id },
          { participant1Id: participant2Id, participant2Id: participant1Id }
        ]
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participant1Id,
        participant2Id
      });
    }

    res.status(201).json({
      message: 'Conversation created/retrieved',
      data: conversation
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

export const getConversationById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { conversationId } = req.params;

    const Conversation = (sequelize as any).models.Conversation;
    const User = (sequelize as any).models.User;

    const conversation = await Conversation.findByPk(conversationId, {
      include: [
        { model: User, as: 'participant1', attributes: ['id', 'email', 'businessName', 'companyName'] },
        { model: User, as: 'participant2', attributes: ['id', 'email', 'businessName', 'companyName'] }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.status(200).json({
      message: 'Conversation retrieved',
      data: conversation
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};
