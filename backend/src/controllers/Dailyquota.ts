/**
 * checkDailyLimit middleware / helpers
 *
 * Usage in wastePostController.ts:
 *
 *   import { checkPostLimit, incrementPostCount, checkViewLimit, incrementViewCount } from '../middleware/dailyQuota';
 *
 * Then in your route or controller:
 *   router.post('/', authenticate, checkPostLimit, createWastePost);
 *
 * Or call the helpers directly inside a controller function before doing work.
 */

import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

const FREE_DAILY_LIMIT = 3;
const SUBSCRIPTION_BONUS = 10;

/** Returns today's date as YYYY-MM-DD (UTC). */
export const getTodayDate = (): string => new Date().toISOString().split('T')[0];

/** Calculates the effective daily limit for a user based on subscription status. */
export const getDailyLimit = (subscriptionStatus: string): number =>
    FREE_DAILY_LIMIT + (subscriptionStatus === 'active' ? SUBSCRIPTION_BONUS : 0);

// ---------------------------------------------------------------------------
// Post limit (business owners)
// ---------------------------------------------------------------------------

/**
 * Express middleware — blocks the request with 429 if the business user has
 * exhausted their daily post quota.  Mount before `createWastePost`.
 */
export const checkPostLimit = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Authentication required' });

        if (req.user?.type !== 'business') return next(); // only applies to business users

        const user: any = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const today = getTodayDate();
        const dailyLimit = getDailyLimit(user.subscriptionStatus);

        // Reset stale count if we've crossed midnight
        const postsToday = user.lastPostDate === today ? (user.dailyPostCount || 0) : 0;

        if (postsToday >= dailyLimit) {
            const isSubscribed = user.subscriptionStatus === 'active';
            return res.status(429).json({
                message: isSubscribed
                    ? `You have reached your daily limit of ${dailyLimit} posts (${FREE_DAILY_LIMIT} free + ${SUBSCRIPTION_BONUS} subscription). Limit resets at midnight UTC.`
                    : `You have reached your daily free limit of ${FREE_DAILY_LIMIT} posts. Subscribe to post up to ${FREE_DAILY_LIMIT + SUBSCRIPTION_BONUS} items per day.`,
                data: {
                    dailyLimit,
                    postsToday,
                    postsRemaining: 0,
                    subscriptionStatus: user.subscriptionStatus || 'none',
                    requiresSubscription: !isSubscribed
                }
            });
        }

        return next();
    } catch (error: any) {
        return res.status(500).json({ message: 'Error checking post limit', error: error.message });
    }
};

/**
 * Increments the user's daily post counter.
 * Call this AFTER successfully creating a waste post.
 *
 * @param userId - The authenticated user's ID
 */
export const incrementPostCount = async (userId: number): Promise<void> => {
    const user: any = await User.findByPk(userId);
    if (!user) return;

    const today = getTodayDate();
    const currentCount = user.lastPostDate === today ? (user.dailyPostCount || 0) : 0;

    await User.update(
        {
            dailyPostCount: currentCount + 1,
            lastPostDate: today
        } as any,
        { where: { id: userId } }
    );
};

// ---------------------------------------------------------------------------
// View limit (recyclers)
// ---------------------------------------------------------------------------

/**
 * Express middleware — blocks the request with 429 if the recycler has
 * exhausted their daily waste-post detail-view quota.
 * Mount before `getWastePostDetails` (for recycler users only).
 */
export const checkViewLimit = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Authentication required' });

        if (req.user?.type !== 'recycler') return next(); // only applies to recyclers

        const user: any = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const today = getTodayDate();
        const dailyLimit = getDailyLimit(user.subscriptionStatus);
        const viewsToday = user.lastViewDate === today ? (user.dailyViewCount || 0) : 0;

        if (viewsToday >= dailyLimit) {
            const isSubscribed = user.subscriptionStatus === 'active';
            return res.status(429).json({
                message: isSubscribed
                    ? `You have reached your daily limit of ${dailyLimit} detail views. Limit resets at midnight UTC.`
                    : `You have reached your daily free limit of ${FREE_DAILY_LIMIT} detail views. Subscribe to view up to ${FREE_DAILY_LIMIT + SUBSCRIPTION_BONUS} posts per day.`,
                data: {
                    dailyLimit,
                    viewsToday,
                    viewsRemaining: 0,
                    subscriptionStatus: user.subscriptionStatus || 'none',
                    requiresSubscription: !isSubscribed
                }
            });
        }

        return next();
    } catch (error: any) {
        return res.status(500).json({ message: 'Error checking view limit', error: error.message });
    }
};

/**
 * Increments the recycler's daily view counter.
 * Call this AFTER successfully returning waste post details.
 *
 * @param userId - The authenticated user's ID
 */
export const incrementViewCount = async (userId: number): Promise<void> => {
    const user: any = await User.findByPk(userId);
    if (!user) return;

    const today = getTodayDate();
    const currentCount = user.lastViewDate === today ? (user.dailyViewCount || 0) : 0;

    await User.update(
        {
            dailyViewCount: currentCount + 1,
            lastViewDate: today
        } as any,
        { where: { id: userId } }
    );
};