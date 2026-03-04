import { WastePost, Notification, Collection, User } from '../models';
import { Op } from 'sequelize';

export async function checkPickupDeadlines(): Promise<void> {
  try {
    console.log('🕐 Checking collection deadlines...');

    const now = new Date();

    // Find all approved/scheduled collections that have passed their deadline
    const expiredCollections = await Collection.findAll({
      where: {
        status: { [Op.in]: ['approved', 'scheduled'] },
        [Op.or]: [
          // For scheduled collections: deadline = scheduledDate - 1 hour (which is in pickupDeadline)
          // For unscheduled collections: deadline = requestDate + 1 hour (also in pickupDeadline)
          { scheduledDate: { [Op.and]: { [Op.not]: null, [Op.lte]: new Date(now.getTime() + 60 * 60 * 1000) } } },
          // If no scheduledDate, check if requestDate + 1 hour has passed
          {
            [Op.and]: [
              { scheduledDate: null },
              { requestDate: { [Op.lte]: new Date(now.getTime() - 60 * 60 * 1000) } }
            ]
          }
        ]
      },
      include: [
        {
          model: WastePost,
          as: 'post',
          attributes: ['id', 'title', 'businessId', 'collectionStatus']
        },
        {
          model: User,
          as: 'recycler',
          attributes: ['id', 'email', 'companyName']
        },
        {
          model: User,
          as: 'business',
          attributes: ['id', 'email', 'businessName']
        }
      ]
    });

    if (expiredCollections.length === 0) {
      console.log('✅ No expired collections found');
      return;
    }

    console.log(`⏰ Found ${expiredCollections.length} expired collection(s)`);

    for (const collection of expiredCollections) {
      try {
        const post = (collection as any).post;
        const recycler = (collection as any).recycler;
        const business = (collection as any).business;

        // Set collection status to expired
        collection.status = 'expired';
        await collection.save();

        // Revert post back to ACTIVE
        if (post) {
          post.collectionStatus = 'ACTIVE';
          post.approvedRecyclerId = null;
          post.pickupDeadline = null;
          await post.save();
        }

        console.log(`✅ Collection ${collection.id} expired and post ${post?.id} reverted to ACTIVE`);

        // Notify recycler
        if (recycler) {
          await Notification.create({
            userId: recycler.id,
            type: 'COLLECTION_REQUEST',
            title: `Collection Request Expired`,
            message: `Your pickup window for "${post?.title}" has expired. The post is now available for other recyclers.`,
            relatedId: post?.id
          });
        }

        // Notify business
        if (business) {
          await Notification.create({
            userId: business.id,
            type: 'COLLECTION_REQUEST',
            title: `Collection Request Expired`,
            message: `The recycler did not pick up "${post?.title}" within the scheduled time. It's now available for other recyclers.`,
            relatedId: post?.id
          });
        }
      } catch (error) {
        console.error(`❌ Error processing collection ${collection.id}:`, error);
      }
    }

    console.log(`✅ Processed ${expiredCollections.length} expired collection(s)`);
  } catch (error) {
    console.error('❌ Error checking pickup deadlines:', error);
  }
}

export function initializePickupDeadlineChecker(): void {
  console.log('🚀 Initializing collection deadline checker (runs every 5 minutes)...');

  checkPickupDeadlines();

  setInterval(checkPickupDeadlines, 5 * 60 * 1000);

  console.log('✅ Collection deadline checker initialized');
}

export default {
  checkPickupDeadlines,
  initializePickupDeadlineChecker
};
