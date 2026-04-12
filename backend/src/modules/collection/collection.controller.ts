// Collection Module - Simplified wrapper
// Re-exports collection endpoints

import { Request, Response } from 'express';
import { Collection, WastePost, User, Notification } from '../../models';
import { Op } from 'sequelize';

export const getAvailablePosts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, wasteType, city } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = { status: 'active', visibility: 'public' };
    if (wasteType) whereClause.wasteType = wasteType;
    if (city) whereClause.city = city;

    const { count, rows } = await WastePost.findAndCountAll({
      where: whereClause,
      include: [{ model: User, as: 'business', attributes: ['id', 'businessName', 'email', 'phone', 'type'] }],
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Available posts retrieved successfully',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getUserCollections = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = { [Op.or]: [{ businessId: userId }, { recyclerId: userId }] };
    if (status) whereClause.status = status;

    const { count, rows } = await Collection.findAndCountAll({
      where: whereClause,
      include: [
        { model: WastePost, as: 'post', attributes: ['id', 'title', 'wasteType'] },
        { model: User, as: 'business', attributes: ['id', 'businessName', 'email'] },
        { model: User, as: 'recycler', attributes: ['id', 'companyName', 'email'] }
      ],
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Collections retrieved successfully',
      pagination: { page: pageNum, limit: limitNum, total: count, pages: Math.ceil(count / limitNum) },
      data: rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

export const requestCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId, proposedDate, notes } = req.body;
    const recyclerId = req.user?.id;

    if (!postId || !proposedDate) {
      return res.status(400).json({ error: 'postId and proposedDate are required' });
    }

    const post = await WastePost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Waste post not found' });
    }

    const collection = await Collection.create({
      postId,
      businessId: post.businessId,
      recyclerId,
      proposedDate,
      notes: notes || null,
      status: 'requested'
    });

    res.status(201).json({
      message: 'Collection request created successfully',
      data: collection
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create collection request' });
  }
};

export const approveCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const { collectionId } = req.params;
    const { scheduledDate } = req.body;

    const collection = await Collection.findByPk(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    collection.status = 'approved';
    collection.scheduledDate = scheduledDate;
    await collection.save();

    res.status(200).json({
      message: 'Collection approved successfully',
      data: collection
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve collection' });
  }
};

export const rejectCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const { collectionId } = req.params;

    const collection = await Collection.findByPk(collectionId);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    collection.status = 'rejected';
    await collection.save();

    res.status(200).json({
      message: 'Collection rejected successfully',
      data: collection
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reject collection' });
  }
};
