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
    console.error('Error fetching available posts:', error);
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
    console.error('Error fetching user collections:', error);
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
      status: 'requested',
      requestDate: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Collection request created successfully',
      data: collection
    });
  } catch (error: any) {
    console.error('Error creating collection request:', error);
    res.status(500).json({ error: 'Failed to create collection request' });
  }
};

export const approveCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const { collectionId } = req.params;
    const { scheduledDate } = req.body;
    const businessId = req.user?.id;

    // Fetch collection with all necessary relations
    const collection = await Collection.findByPk(collectionId, {
      include: [
        { model: WastePost, as: 'post' },
        { model: User, as: 'recycler', attributes: ['id', 'email', 'companyName'] },
        { model: User, as: 'business', attributes: ['id', 'email', 'businessName'] }
      ]
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Authorization: only business owner can approve
    if (collection.businessId !== businessId) {
      return res.status(403).json({ error: 'Only the business owner can approve collections' });
    }

    // Update collection
    collection.status = 'approved';
    collection.scheduledDate = scheduledDate;
    await collection.save();

    // Calculate 1-hour pickup deadline
    const pickupDeadline = new Date();
    pickupDeadline.setHours(pickupDeadline.getHours() + 1);

    // Update waste post with 1-hour pickup deadline
    const post = (collection as any).post;
    if (post) {
      post.collectionStatus = 'RESERVED';
      post.approvedRecyclerId = collection.recyclerId;
      post.pickupDeadline = pickupDeadline;
      await post.save();
    }

    // Send notification to recycler with pickup deadline
    const recycler = (collection as any).recycler;
    if (recycler) {
      await Notification.create({
        userId: recycler.id,
        type: 'COLLECTION_REQUEST',
        title: 'Collection Approved',
        message: `Your collection request has been approved! You have 1 hour to pick up "${post?.title}". Pickup deadline: ${new Date(pickupDeadline).toLocaleString()}`,
        relatedId: post?.id
      });
    }

    res.status(200).json({
      message: 'Collection approved successfully. Recycler has 1 hour to pick up.',
      data: collection
    });
  } catch (error: any) {
    console.error('Error approving collection:', error);
    res.status(500).json({ error: 'Failed to approve collection' });
  }
};

export const rejectCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const { collectionId } = req.params;
    const { reason } = req.body;
    const businessId = req.user?.id;

    // Fetch collection with all necessary relations
    const collection = await Collection.findByPk(collectionId, {
      include: [
        { model: WastePost, as: 'post' },
        { model: User, as: 'recycler', attributes: ['id', 'email', 'companyName'] }
      ]
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Authorization: only business owner can reject
    if (collection.businessId !== businessId) {
      return res.status(403).json({ error: 'Only the business owner can reject collections' });
    }

    // Increment rejection count
    const rejectionCount = (collection.rejectionCount || 0) + 1;
    collection.status = 'rejected';
    collection.rejectionCount = rejectionCount;
    await collection.save();

    // Notify recycler of rejection
    const recycler = (collection as any).recycler;
    if (recycler) {
      await Notification.create({
        userId: recycler.id,
        type: 'COLLECTION_REQUEST',
        title: 'Collection Request Rejected',
        message: `Your collection request has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
        relatedId: (collection as any).post?.id
      });
    }

    res.status(200).json({
      message: 'Collection rejected successfully',
      data: collection
    });
  } catch (error: any) {
    console.error('Error rejecting collection:', error);
    res.status(500).json({ error: 'Failed to reject collection' });
  }
};

export const confirmPickup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { collectionId } = req.params;
    const userId = req.user?.id;

    // Fetch collection with all necessary relations
    const collection = await Collection.findByPk(collectionId, {
      include: [
        { model: WastePost, as: 'post' },
        { model: User, as: 'recycler', attributes: ['id', 'email', 'companyName'] },
        { model: User, as: 'business', attributes: ['id', 'email', 'businessName'] }
      ]
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Authorization: only recycler or business can confirm pickup
    if (collection.recyclerId !== userId && collection.businessId !== userId) {
      return res.status(403).json({ error: 'Not authorized to confirm this pickup' });
    }

    // Check if collection is in approved/scheduled state
    if (!['approved', 'scheduled'].includes(collection.status)) {
      return res.status(400).json({ error: 'Collection must be approved or scheduled to confirm pickup' });
    }

    // Update collection
    collection.status = 'completed';
    collection.completedAt = new Date();
    collection.confirmedBy = collection.recyclerId === userId ? 'recycler' : 'business';
    await collection.save();

    // Update waste post status
    const post = (collection as any).post;
    if (post) {
      post.collectionStatus = 'PICKED_UP';
      post.pickedUpAt = new Date();
      post.status = 'collected';
      post.approvedRecyclerId = null;
      post.pickupDeadline = null;
      await post.save();
    }

    // Notify both parties
    const recycler = (collection as any).recycler;
    const business = (collection as any).business;

    if (recycler && collection.recyclerId !== userId) {
      await Notification.create({
        userId: recycler.id,
        type: 'COLLECTION_REQUEST',
        title: 'Pickup Confirmed',
        message: `Pickup of "${post?.title}" has been confirmed.`,
        relatedId: post?.id
      });
    }

    if (business && collection.businessId !== userId) {
      await Notification.create({
        userId: business.id,
        type: 'COLLECTION_REQUEST',
        title: 'Pickup Confirmed',
        message: `Pickup of "${post?.title}" has been confirmed.`,
        relatedId: post?.id
      });
    }

    res.status(200).json({
      message: 'Pickup confirmed successfully',
      data: collection
    });
  } catch (error: any) {
    console.error('Error confirming pickup:', error);
    res.status(500).json({ error: 'Failed to confirm pickup' });
  }
};
