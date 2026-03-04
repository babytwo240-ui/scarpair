import { Request, Response } from 'express';
import { Collection, WastePost, User, Notification } from '../models';
import { Op } from 'sequelize';
import { parseUserInputAsManillaTime, getNowUtc } from '../utils/philippineTimeUtil';

export const getAvailablePosts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, wasteType, city, radius } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {
      status: 'active',  
      visibility: 'public'
    };

    if (wasteType) {
      whereClause.wasteType = wasteType;
    }

    if (city) {
      whereClause.city = city;
    }

    const { count, rows } = await WastePost.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'email', 'phone', 'type']
        }
      ],
      limit: limitNum,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });
    
    const serializedRows = rows.map((post: any) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      wasteType: post.wasteType,
      quantity: post.quantity,
      unit: post.unit,
      condition: post.condition,
      status: post.status,
      visibility: post.visibility,
      businessId: post.businessId,
      latitude: post.latitude,
      longitude: post.longitude,
      city: post.city,
      address: post.address,
      price: post.price,
      images: post.images,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      business: post.business ? {
        id: post.business.id,
        businessName: post.business.businessName,
        email: post.business.email,
        phone: post.business.phone,
        type: post.business.type
      } : null
    }));

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Available posts retrieved successfully',
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      },
      data: serializedRows
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching available posts', error: error.message });
  }
};
export const requestCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const { postId, scheduledDate } = req.body;
    const recyclerId = req.user?.id;

    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    if (!recyclerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const recycler = await User.findByPk(recyclerId);
    if (!recycler || recycler.type !== 'recycler') {
      return res.status(403).json({ message: 'Only recyclers can request collections' });
    }

    const post = await WastePost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Waste post not found' });
    }

    if (post.status !== 'active') {
      return res.status(400).json({ message: 'This post is no longer available' });
    }

    // ===== UNIQUE TRANSACTION SYSTEM VALIDATION =====
    
    // 1. Check for active collections (pending, approved, scheduled)
    const existingRequest = await Collection.findOne({
      where: {
        postId,
        recyclerId,
        status: { [Op.in]: ['pending', 'approved', 'scheduled'] }
      }
    });

    if (existingRequest) {
      return res.status(409).json({ message: 'You already have a pending request for this post' });
    }

    // 2. Check request count for this recycler on this post (all statuses, cumulative)
    const totalRequests = await Collection.count({
      where: {
        postId,
        recyclerId
      }
    });

    console.log(`[UNIQUE_TX] Request count for recycler ${recyclerId} on post ${postId}: ${totalRequests}`);

    if (totalRequests >= 4) {
      return res.status(409).json({
        message: 'You have reached the maximum number of requests for this post (4 requests)',
        code: 'MAX_REQUESTS_EXCEEDED'
      });
    }

    // 3. Check cancellation count for this recycler on this post
    const cancellationCount = await Collection.count({
      where: {
        postId,
        recyclerId,
        status: 'cancelled'
      }
    });

    console.log(`[UNIQUE_TX] Cancellation count for recycler ${recyclerId} on post ${postId}: ${cancellationCount}`);
    let cancelLocked = false;
    if (cancellationCount >= 3) {
      cancelLocked = true;
      console.log(`[UNIQUE_TX] Recycler ${recyclerId} has hit cancellation limit (3). Cancel button will be locked.`);
    }

    // 4. Check rejection count for this business on this recycler-post combo
    const rejectionCount = await Collection.count({
      where: {
        postId,
        recyclerId,
        businessId: post.businessId,
        status: 'rejected'
      }
    });

    console.log(`[UNIQUE_TX] Rejection count for recycler ${recyclerId} from business ${post.businessId} on post ${postId}: ${rejectionCount}`);
    let forceApproval = false;
    if (rejectionCount >= 4) {
      forceApproval = true;
      console.log(`[UNIQUE_TX] Business ${post.businessId} has rejected recycler ${recyclerId} 4 times. Next request will force approval.`);
    }

    // 5. Generate transaction code: COLL-YYYYMMDD-NNN
    const nowUtc = getNowUtc();
    const year = nowUtc.getUTCFullYear();
    const month = String(nowUtc.getUTCMonth() + 1).padStart(2, '0');
    const day = String(nowUtc.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Count how many collections were created today to generate sequential NNN
    const todayStart = new Date(Date.UTC(year, nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 0, 0, 0));
    const todayEnd = new Date(Date.UTC(year, nowUtc.getUTCMonth(), nowUtc.getUTCDate(), 23, 59, 59));
    
    const countToday = await Collection.count({
      where: {
        createdAt: {
          [Op.between]: [todayStart, todayEnd]
        }
      }
    });

    const sequenceNum = String(countToday + 1).padStart(3, '0');
    const transactionCode = `COLL-${dateStr}-${sequenceNum}`;

    console.log(`[UNIQUE_TX] Generated transaction code: ${transactionCode}`);

    // 6. Parse scheduled date if provided
    let collectionScheduledDate = null;
    let collectionScheduledDateISO = null;
    if (scheduledDate) {
      collectionScheduledDate = parseUserInputAsManillaTime(scheduledDate);
      collectionScheduledDateISO = collectionScheduledDate.toISOString();
      console.log('🔍 DEBUG scheduledDate:');
      console.log('   User input:', scheduledDate);
      console.log('   Parsed as UTC:', collectionScheduledDate.toISOString());
      console.log('   Storing as ISO string:', collectionScheduledDateISO);
    }

    const nowUtcISO = nowUtc.toISOString();
    console.log('🔍 DEBUG requestDate (NOW):');
    console.log('   UTC time:', nowUtcISO);

    // 7. Determine if this is a retry
    const isRetry = totalRequests > 0;
    const previousCollectionId = null; // Will be set if explicitly needed

    // 8. Create collection with all new fields
    const collection = await Collection.create({
      postId,
      recyclerId,
      businessId: post.businessId,
      requestDate: nowUtcISO,
      scheduledDate: collectionScheduledDateISO,
      status: forceApproval ? 'approved' : 'pending', // Force approval if rejection limit hit
      transactionCode,
      rejectionCount: forceApproval ? 4 : 0, // Pre-populate with 4 if forced approval
      cancellationCount: cancellationCount, // Carry over cancellation count from previous attempts
      isRetry,
      previousCollectionId
    });

    console.log('🔍 DEBUG After collection.create():');
    console.log('   requestDate stored:', collection.requestDate);
    console.log('   scheduledDate stored:', collection.scheduledDate);
    console.log('   transactionCode stored:', collection.transactionCode);
    console.log('   cancellationCount:', collection.cancellationCount);
    console.log('   status:', collection.status);
    console.log(`[UNIQUE_TX] Collection ${collection.id} created with transaction code ${transactionCode}, cancel_locked=${cancelLocked}, force_approved=${forceApproval}`);

    try {
      const recyclerInfo = await User.findByPk(recyclerId);
      const messageText = forceApproval
        ? `${recyclerInfo?.companyName || 'A recycler'} has requested to collect "${post.title}" - AUTO-APPROVED due to previous rejections`
        : `${recyclerInfo?.companyName || 'A recycler'} has requested to collect "${post.title}"`;

      await Notification.create({
        userId: post.businessId,
        type: 'COLLECTION_REQUEST',
        title: forceApproval ? 'Collection Request - Auto-Approved' : 'New Collection Request',
        message: messageText,
        relatedId: collection.id
      });
    } catch (notifError) {
      console.error('⚠️ Failed to create notification:', notifError);
    }

    const collectionResponse = {
      id: collection.id,
      postId: collection.postId,
      recyclerId: collection.recyclerId,
      businessId: collection.businessId,
      status: collection.status,
      requestDate: collection.requestDate,
      scheduledDate: collection.scheduledDate,
      transactionCode: collection.transactionCode,
      cancellationCount: collection.cancellationCount,
      cancelLocked,
      forceApproved: forceApproval,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt
    };

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: forceApproval ? 'Collection request submitted and auto-approved' : 'Collection request submitted successfully',
      data: collectionResponse
    });
    res.status(201).send(responseBody);
  } catch (error: any) {
    console.error('❌ Error in requestCollection:', error);
    res.status(500).json({ message: 'Error requesting collection', error: error.message });
  }
};

export const scheduleCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;
    const userId = req.user?.id;

    if (!scheduledDate) {
      return res.status(400).json({ message: 'Scheduled date is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.businessId !== userId) {
      return res.status(403).json({ message: 'Only the business owner can schedule collection pickup dates' });
    }

    if (collection.status !== 'approved') {
      return res.status(400).json({ message: 'Collection must be approved before scheduling' });
    }

    // scheduledDate is from datetime-local: user's Manila local time 
    // Convert to UTC using centralized utility
    let scheduledUTC: Date;
    try {
      scheduledUTC = parseUserInputAsManillaTime(scheduledDate);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid date format for scheduledDate' });
    }
    
    // Check if scheduled time is in the future (compare UTC times)
    const nowUTC = getNowUtc();
    if (scheduledUTC.getTime() <= nowUTC.getTime()) {
      return res.status(400).json({ message: 'Scheduled date must be in the future' });
    }
    
    // Store the UTC date as ISO string to bypass Sequelize timezone conversion
    collection.scheduledDate = scheduledUTC.toISOString() as any;
    collection.status = 'scheduled';
    await collection.save();

    // Update the associated waste post's pickup deadline
    const post = await WastePost.findByPk(collection.postId);
    if (post && collection.scheduledDate) {
      // If scheduled, deadline is 1 hour BEFORE scheduled time
      const deadlineUTC = new Date(scheduledUTC.getTime() - 60 * 60 * 1000);
      post.pickupDeadline = deadlineUTC.toISOString() as any;
      await post.save();
    }

    // Defensive serialization
    const collectionResponse = {
      id: collection.id,
      postId: collection.postId,
      recyclerId: collection.recyclerId,
      businessId: collection.businessId,
      status: collection.status,
      requestDate: collection.requestDate,
      scheduledDate: collection.scheduledDate,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt
    };

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: `Collection scheduled successfully. Pickup deadline is 1 hour before scheduled time.`,
      data: collectionResponse
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    res.status(500).json({ message: 'Error scheduling collection', error: error.message });
  }
};

export const confirmCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.recyclerId !== userId && collection.businessId !== userId) {
      return res.status(403).json({ message: 'You can only confirm your own collections' });
    }

    if (collection.status !== 'scheduled') {
      return res.status(400).json({ message: 'Collection must be scheduled before confirming' });
    }

    collection.completedAt = new Date();
    collection.status = 'completed';
    collection.confirmedBy = userId === collection.recyclerId ? 'recycler' : 'business';
    await collection.save();

    const collectionResponse = {
      id: collection.id,
      postId: collection.postId,
      recyclerId: collection.recyclerId,
      businessId: collection.businessId,
      status: collection.status,
      requestDate: collection.requestDate,
      scheduledDate: collection.scheduledDate,
      completedAt: collection.completedAt,
      confirmedBy: collection.confirmedBy,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt
    };

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Collection confirmed successfully',
      data: collectionResponse
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    res.status(500).json({ message: 'Error confirming collection', error: error.message });
  }
};

export const acceptMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const recyclerId = req.user?.id;

    if (!recyclerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.recyclerId !== recyclerId) {
      return res.status(403).json({ message: 'Only the recycler can accept materials' });
    }

    if (collection.status !== 'completed') {
      return res.status(400).json({ message: 'Collection must be completed before accepting materials' });
    }

    collection.status = 'confirmed';
    collection.confirmedBy = 'recycler';
    await collection.save();

    const post = await WastePost.findByPk(collection.postId);
    if (post) {
      post.status = 'collected';
      post.collectionStatus = 'COMPLETED'; 
      await post.save();
    }
    const collectionResponse = {
      id: collection.id,
      postId: collection.postId,
      recyclerId: collection.recyclerId,
      businessId: collection.businessId,
      status: collection.status,
      requestDate: collection.requestDate,
      scheduledDate: collection.scheduledDate,
      completedAt: collection.completedAt,
      confirmedBy: collection.confirmedBy,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt
    };

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Materials accepted successfully. Collection completed and chat closed. Post marked as collected.',
      data: collectionResponse
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    res.status(500).json({ message: 'Error accepting materials', error: error.message });
  }
};
export const getCollectionDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const collection = await Collection.findByPk(id, {
      include: [
        {
          model: WastePost,
          as: 'post',
          attributes: ['id', 'title', 'description', 'wasteType', 'quantity', 'unit', 'condition', 'status', 'images']
        },
        {
          model: User,
          as: 'recycler',
          attributes: ['id', 'businessName', 'companyName', 'email', 'phone', 'type']
        },
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'companyName', 'email', 'phone', 'type']
        }
      ]
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const collectionResponse: any = {
      id: collection.id,
      postId: collection.postId,
      recyclerId: collection.recyclerId,
      businessId: collection.businessId,
      status: collection.status,
      requestDate: collection.requestDate || null,
      scheduledDate: collection.scheduledDate || null,
      completedAt: collection.completedAt ? new Date(collection.completedAt).toISOString() : null,
      confirmedBy: collection.confirmedBy,
      createdAt: collection.createdAt ? new Date(collection.createdAt).toISOString() : null,
      updatedAt: collection.updatedAt ? new Date(collection.updatedAt).toISOString() : null,
      post: collection.post ? {
        id: collection.post.id,
        title: collection.post.title,
        description: collection.post.description,
        wasteType: collection.post.wasteType,
        quantity: collection.post.quantity,
        unit: collection.post.unit,
        condition: collection.post.condition,
        status: collection.post.status,
        images: collection.post.images
      } : null,
      recycler: collection.recycler ? {
        id: collection.recycler.id,
        businessName: collection.recycler.businessName,
        companyName: collection.recycler.companyName,
        email: collection.recycler.email,
        phone: collection.recycler.phone,
        type: collection.recycler.type
      } : null,
      business: collection.business ? {
        id: collection.business.id,
        businessName: collection.business.businessName,
        companyName: collection.business.companyName,
        email: collection.business.email,
        phone: collection.business.phone,
        type: collection.business.type
      } : null
    };

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Collection details retrieved successfully',
      data: collectionResponse
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching collection details', error: error.message });
  }
};

export const getUserCollections = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {
      [Op.or]: [
        { recyclerId: userId },
        { businessId: userId }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    console.log('📥 getUserCollections called for user:', userId);
    console.log('   Query params:', { status, page: pageNum, limit: limitNum });

    const { count, rows } = await Collection.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: WastePost,
          as: 'post',
          attributes: ['id', 'title', 'wasteType', 'quantity', 'unit', 'status']
        },
        {
          model: User,
          as: 'recycler',
          attributes: ['id', 'businessName', 'companyName', 'email']
        },
        {
          model: User,
          as: 'business',
          attributes: ['id', 'businessName', 'companyName', 'email']
        }
      ],
      limit: limitNum,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ Query successful. Found', count, 'total collections');

    const serializedRows = rows.map((collection: any) => ({
      id: collection.id,
      postId: collection.postId,
      recyclerId: collection.recyclerId,
      businessId: collection.businessId,
      status: collection.status,
      requestDate: collection.requestDate ? new Date(collection.requestDate).toISOString() : null,
      scheduledDate: collection.scheduledDate ? new Date(collection.scheduledDate).toISOString() : null,
      completedAt: collection.completedAt ? new Date(collection.completedAt).toISOString() : null,
      confirmedBy: collection.confirmedBy,
      createdAt: collection.createdAt ? new Date(collection.createdAt).toISOString() : null,
      updatedAt: collection.updatedAt ? new Date(collection.updatedAt).toISOString() : null,
      transactionCode: collection.transactionCode,
      rejectionCount: collection.rejectionCount,
      cancellationCount: collection.cancellationCount,
      cancellationReason: collection.cancellationReason,
      previousCollectionId: collection.previousCollectionId,
      isRetry: collection.isRetry,
      post: collection.post ? {
        id: collection.post.id,
        title: collection.post.title,
        wasteType: collection.post.wasteType,
        quantity: collection.post.quantity,
        unit: collection.post.unit,
        status: collection.post.status
      } : null,
      recycler: collection.recycler ? {
        id: collection.recycler.id,
        businessName: collection.recycler.businessName,
        companyName: collection.recycler.companyName,
        email: collection.recycler.email
      } : null,
      business: collection.business ? {
        id: collection.business.id,
        businessName: collection.business.businessName,
        companyName: collection.business.companyName,
        email: collection.business.email
      } : null
    }));

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'User collections retrieved successfully',
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum)
      },
      data: serializedRows
    });
    res.status(200).send(responseBody);
    console.log('✅ Response sent successfully');
  } catch (error: any) {
    console.error('❌ Error in getUserCollections:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ message: 'Error fetching user collections', error: error.message });
  }
};

export const approveCollectionRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.businessId !== userId) {
      return res.status(403).json({ message: 'Only the business owner can approve this request' });
    }

    if (collection.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be approved' });
    }

    collection.status = 'approved';
    await collection.save();

    // Calculate pickup deadline based on scheduled date or current time
    let pickupDeadline;
    let deadlineMessage = '';
    const post = await WastePost.findByPk(collection.postId);
    if (post) {
      post.collectionStatus = 'RESERVED';
      post.approvedRecyclerId = collection.recyclerId;
      
      if (collection.scheduledDate) {
        // If scheduled, deadline is 1 hour BEFORE scheduled time
        pickupDeadline = new Date(new Date(collection.scheduledDate).getTime() - 60 * 60 * 1000);
        deadlineMessage = `Recycler must arrive by ${new Date(pickupDeadline).toLocaleString()} (1 hour before scheduled pickup at ${new Date(collection.scheduledDate).toLocaleString()})`;
      } else {
        // If not scheduled, deadline is 1 hour from now
        pickupDeadline = new Date(Date.now() + 60 * 60 * 1000);
        deadlineMessage = `Recycler has 1 hour to pick up (deadline: ${new Date(pickupDeadline).toLocaleString()})`;
      }
      post.pickupDeadline = pickupDeadline;
      await post.save();
    }

    const collectionResponse = {
      id: collection.id,
      postId: collection.postId,
      recyclerId: collection.recyclerId,
      businessId: collection.businessId,
      status: collection.status,
      requestDate: collection.requestDate ? new Date(collection.requestDate).toISOString() : null,
      scheduledDate: collection.scheduledDate ? new Date(collection.scheduledDate).toISOString() : null,
      createdAt: collection.createdAt ? new Date(collection.createdAt).toISOString() : null,
      updatedAt: collection.updatedAt ? new Date(collection.updatedAt).toISOString() : null
    };

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: `Collection request approved successfully. ${deadlineMessage}`,
      data: collectionResponse
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    console.error('❌ Error in approveCollectionRequest:', error);
    res.status(500).json({ message: 'Error approving collection request', error: error.message });
  }
};

export const rejectCollectionRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.businessId !== userId) {
      return res.status(403).json({ message: 'Only the business owner can reject this request' });
    }

    if (collection.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be rejected' });
    }

    // ===== UNIQUE TRANSACTION SYSTEM: Update rejection count =====
    const newRejectionCount = (collection.rejectionCount || 0) + 1;
    console.log(`[UNIQUE_TX] Incrementing rejectionCount from ${collection.rejectionCount} to ${newRejectionCount} for recycler ${collection.recyclerId}`);

    // Update collection status to rejected and increment rejection count
    collection.status = 'rejected';
    collection.rejectionCount = newRejectionCount;
    await collection.save();

    console.log(`[UNIQUE_TX] Collection ${collection.id} rejected. Rejection count is now ${collection.rejectionCount}`);

    // Don't modify the post - a rejected pending request doesn't affect post availability
    // The post should remain available for other recyclers to request

    const collectionResponse = {
      id: collection.id,
      postId: collection.postId,
      recyclerId: collection.recyclerId,
      businessId: collection.businessId,
      status: collection.status,
      rejectionCount: collection.rejectionCount,
      requestDate: collection.requestDate ? new Date(collection.requestDate).toISOString() : null,
      scheduledDate: collection.scheduledDate ? new Date(collection.scheduledDate).toISOString() : null,
      createdAt: collection.createdAt ? new Date(collection.createdAt).toISOString() : null,
      updatedAt: collection.updatedAt ? new Date(collection.updatedAt).toISOString() : null
    };

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Collection request rejected successfully',
      data: collectionResponse
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    console.error('❌ Error in rejectCollectionRequest:', error);
    res.status(500).json({ message: 'Error rejecting collection request', error: error.message });
  }
};

export const cancelApprovedCollection = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user?.id;
    const userType = req.user?.type;

    console.log('🔴 [CANCEL] Request received:');
    console.log('   Collection ID:', id);
    console.log('   User ID:', userId, 'Type:', userType);
    console.log('   Cancellation reason:', cancellationReason);

    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    console.log('   Current status:', collection.status);
    console.log('   Business ID:', collection.businessId, '| Recycler ID:', collection.recyclerId);

    // Allow both business owner and recycler to cancel
    const isBusinessOwner = collection.businessId === userId;
    const isRecycler = collection.recyclerId === userId;

    console.log('   isBusinessOwner:', isBusinessOwner, '| isRecycler:', isRecycler);

    if (!isBusinessOwner && !isRecycler) {
      console.log('❌ [CANCEL] Unauthorized: User is neither business owner nor recycler');
      return res.status(403).json({ message: 'Only the business owner or recycler can cancel this collection' });
    }

    if (collection.status !== 'pending' && collection.status !== 'approved' && collection.status !== 'scheduled') {
      console.log(`❌ [CANCEL] Invalid status: Cannot cancel collection with status '${collection.status}'`);
      return res.status(400).json({ message: `Cannot cancel collection with status '${collection.status}'` });
    }

    // ===== UNIQUE TRANSACTION SYSTEM: Handle cancellation logic =====
    
    if (isRecycler) {
      // Check if recycler has already used 3 cancellations
      if ((collection.cancellationCount || 0) >= 3) {
        console.log(`❌ [CANCEL] Recycler has reached max cancellations (${collection.cancellationCount}/3)`);
        return res.status(400).json({ message: 'You have used all 3 allowed cancellations for this post. You must proceed with this collection.' });
      }
      
      // Recycler cancelling: increment cancellation count
      const newCancellationCount = (collection.cancellationCount || 0) + 1;
      collection.cancellationCount = newCancellationCount;
      console.log(`[UNIQUE_TX] Recycler ${userId} cancelling. Cancellation count: ${collection.cancellationCount}`);
    } else if (isBusinessOwner) {
      // Business cancelling: store the cancellation reason
      if (!cancellationReason || !['SCHEDULE_TOO_LONG', 'TIME_CONFLICT', 'RECYCLER_UNAVAILABLE', 'OTHER'].includes(cancellationReason)) {
        return res.status(400).json({ message: 'Valid cancellation reason is required for business cancellation' });
      }
      collection.cancellationReason = cancellationReason;
      console.log(`[UNIQUE_TX] Business cancelling with reason: ${cancellationReason}`);
    }

    // Update collection status to cancelled
    collection.status = 'cancelled';
    await collection.save();

    console.log('✅ [CANCEL] Collection status updated to CANCELLED');

    // Also reset the WastePost collectionStatus to ACTIVE
    const wastePost = await WastePost.findByPk(collection.postId);
    if (wastePost) {
      wastePost.collectionStatus = 'ACTIVE';
      wastePost.approvedRecyclerId = null;
      wastePost.pickupDeadline = null;
      await wastePost.save();
      console.log('✅ [CANCEL] WastePost reset to ACTIVE');
    }

    // Notify the OTHER party
    let notificationUserId: number;
    let notificationMessage: string;

    if (isBusinessOwner) {
      // Send notification to recycler with reason
      notificationUserId = collection.recyclerId;
      const reasonMap: {[key: string]: string} = {
        'SCHEDULE_TOO_LONG': 'The scheduled pickup time was too far in the future',
        'TIME_CONFLICT': 'There was a time conflict',
        'RECYCLER_UNAVAILABLE': 'The recycler was not available',
        'OTHER': 'A reason was provided'
      };
      const reasonText = cancellationReason ? reasonMap[cancellationReason] || cancellationReason : 'a reason';
      notificationMessage = `The business owner has cancelled the approved collection for "${wastePost?.title}". Reason: ${reasonText}. The waste post has been returned to the marketplace.`;
      console.log('📧 [CANCEL] Sending notification to RECYCLER:', notificationUserId);
    } else {
      // Send notification to business
      notificationUserId = collection.businessId;
      notificationMessage = `The recycler has cancelled the approved collection for "${wastePost?.title}". The waste post has been returned to the marketplace.`;
      console.log('📧 [CANCEL] Sending notification to BUSINESS:', notificationUserId);
    }

    if (notificationUserId && wastePost) {
      await Notification.create({
        userId: notificationUserId,
        type: 'COLLECTION_CANCELLED',
        title: 'Collection Cancelled',
        message: notificationMessage,
        relatedId: collection.id
      });
      console.log('✅ [CANCEL] Notification created');
    }

    console.log('✅ [CANCEL] Cancel request completed successfully');
    res.status(200).json({
      message: 'Collection cancelled successfully',
      data: {
        id: collection.id,
        status: collection.status,
        cancellationReason: collection.cancellationReason,
        cancellationCount: collection.cancellationCount
      }
    });
  } catch (error: any) {
    console.error('❌ [CANCEL] Error in cancelApprovedCollection:', error);
    res.status(500).json({ message: 'Error cancelling collection', error: error.message });
  }
};

