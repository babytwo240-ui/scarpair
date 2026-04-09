import { Request, Response } from 'express';
import { User, Subscription, Notification, sequelize } from '../models';
import { Op } from 'sequelize';

const FREE_DAILY_LIMIT = 3;
const SUBSCRIPTION_BONUS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns today's date as a YYYY-MM-DD string (UTC). */
const getTodayDate = (): string => new Date().toISOString().split('T')[0];

/** Returns full quota info for a given user. Resets stale counters in-memory (not persisted here). */
const getUserQuota = async (userId: number) => {
  const user: any = await User.findByPk(userId);
  if (!user) return null;

  const today = getTodayDate();
  const isSubscribed = user.subscriptionStatus === 'active';
  const dailyLimit = FREE_DAILY_LIMIT + (isSubscribed ? SUBSCRIPTION_BONUS : 0);

  // Use 0 if the stored count belongs to a previous day
  const postsToday = user.lastPostDate === today ? (user.dailyPostCount || 0) : 0;
  const viewsToday = user.lastViewDate === today ? (user.dailyViewCount || 0) : 0;

  return {
    userType: user.type,
    subscriptionStatus: user.subscriptionStatus || 'none',
    dailyLimit,
    postsToday,
    viewsToday,
    postsRemaining: Math.max(0, dailyLimit - postsToday),
    viewsRemaining: Math.max(0, dailyLimit - viewsToday),
    isSubscribed
  };
};

// ---------------------------------------------------------------------------
// User-facing endpoints
// ---------------------------------------------------------------------------

/**
 * POST /api/subscriptions/request
 * User requests a subscription after paying via GCash.
 */
export const requestSubscription = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const userType = req.user?.type;
    const { paymentReference } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Block duplicate pending / active requests
    const existing = await Subscription.findOne({
      where: { userId, status: { [Op.in]: ['pending', 'active'] } }
    });

    if (existing) {
      const status = (existing as any).status;
      if (status === 'active') {
        return res.status(400).json({ message: 'You already have an active subscription' });
      }
      return res.status(400).json({
        message: 'You already have a pending subscription request. Please wait for admin approval.'
      });
    }

    const subscription = await Subscription.create({
      userId,
      userType: userType || 'business',
      status: 'pending',
      paymentReference: paymentReference || null,
      extraItemsPerDay: SUBSCRIPTION_BONUS,
      requestedAt: new Date()
    } as any);

    await User.update({ subscriptionStatus: 'pending' } as any, { where: { id: userId } });

    // Notify admin (userId 0 = system / admin inbox)
    const user: any = await User.findByPk(userId);
    const displayName = user?.businessName || user?.companyName || user?.email;

    await Notification.create({
      userId: 0,
      type: 'SUBSCRIPTION_REQUEST',
      title: 'New Subscription Request',
      message: `${displayName} (${userType}) has requested a subscription. Payment ref: ${paymentReference || 'N/A'}`,
      relatedId: (subscription as any).id
    } as any);

    return res.status(201).json({
      message: 'Subscription request submitted. Please wait for admin approval.',
      data: {
        subscriptionId: (subscription as any).id,
        status: 'pending'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error requesting subscription', error: error.message });
  }
};

/**
 * GET /api/subscriptions/status
 * Returns current subscription record + quota for the authenticated user.
 */
export const getSubscriptionStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const subscription = await Subscription.findOne({
      where: { userId, status: { [Op.in]: ['pending', 'active'] } },
      order: [['createdAt', 'DESC']]
    });

    const quota = await getUserQuota(userId);

    return res.status(200).json({
      message: 'Subscription status retrieved',
      data: { subscription: subscription || null, quota }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error getting subscription status', error: error.message });
  }
};

/**
 * GET /api/subscriptions/quota
 * Returns daily remaining quota for the authenticated user.
 */
export const getDailyQuota = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const quota = await getUserQuota(userId);
    if (!quota) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ message: 'Daily quota retrieved', data: quota });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error getting daily quota', error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Admin endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/subscriptions/admin/pending
 * Returns all subscriptions with status 'pending', newest first.
 */
export const adminGetPendingSubscriptions = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Subscription.findAndCountAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'type', 'email', 'businessName', 'companyName', 'phone']
        }
      ],
      order: [['requestedAt', 'ASC']], // oldest requests first so admin clears the queue in order
      limit: limitNum,
      offset
    });

    return res.status(200).json({
      message: 'Pending subscriptions retrieved',
      data: rows,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(count / limitNum),
        totalItems: count,
        itemsPerPage: limitNum
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching pending subscriptions', error: error.message });
  }
};

/**
 * POST /api/subscriptions/admin/:id/approve
 * Activates a pending subscription and bumps the user's subscriptionStatus to 'active'.
 */
export const adminApproveSubscription = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    const subscription: any = await Subscription.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'businessName', 'companyName'] }]
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription request not found' });
    }

    if (subscription.status !== 'pending') {
      return res.status(400).json({
        message: `Cannot approve a subscription with status '${subscription.status}'`
      });
    }

    const now = new Date();
    await subscription.update({
      status: 'active',
      approvedAt: now,
      approvedBy: adminId
    });

    // Flip the user flag so quota checks reflect the new status immediately
    await User.update(
      { subscriptionStatus: 'active' } as any,
      { where: { id: subscription.userId } }
    );

    // Notify the subscriber
    const displayName =
      subscription.user?.businessName || subscription.user?.companyName || subscription.user?.email;

    await Notification.create({
      userId: subscription.userId,
      type: 'SUBSCRIPTION_APPROVED',
      title: 'Subscription Approved',
      message: `Your subscription has been approved! You now have ${SUBSCRIPTION_BONUS} extra items per day.`,
      relatedId: subscription.id
    } as any);

    return res.status(200).json({
      message: `Subscription approved for ${displayName}`,
      data: {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        status: 'active',
        approvedAt: now,
        extraItemsPerDay: subscription.extraItemsPerDay
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error approving subscription', error: error.message });
  }
};

/**
 * POST /api/subscriptions/admin/:id/reject
 * Rejects a pending subscription and resets the user's subscriptionStatus to 'none'.
 * Body: { reason?: string }
 */
export const adminRejectSubscription = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    const { reason } = req.body;

    const subscription: any = await Subscription.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'businessName', 'companyName'] }]
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription request not found' });
    }

    if (subscription.status !== 'pending') {
      return res.status(400).json({
        message: `Cannot reject a subscription with status '${subscription.status}'`
      });
    }

    await subscription.update({
      status: 'rejected',
      approvedBy: adminId,
      rejectionReason: reason || null
    });

    // Reset user flag so they can submit a new request
    await User.update(
      { subscriptionStatus: 'none' } as any,
      { where: { id: subscription.userId } }
    );

    const displayName =
      subscription.user?.businessName || subscription.user?.companyName || subscription.user?.email;

    await Notification.create({
      userId: subscription.userId,
      type: 'SUBSCRIPTION_REJECTED',
      title: 'Subscription Request Rejected',
      message: reason
        ? `Your subscription request was not approved. Reason: ${reason}`
        : 'Your subscription request was not approved. Please contact support for more information.',
      relatedId: subscription.id
    } as any);

    return res.status(200).json({
      message: `Subscription rejected for ${displayName}`,
      data: {
        subscriptionId: subscription.id,
        userId: subscription.userId,
        status: 'rejected',
        rejectionReason: reason || null
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error rejecting subscription', error: error.message });
  }
};