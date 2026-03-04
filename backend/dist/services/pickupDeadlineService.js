"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPickupDeadlines = checkPickupDeadlines;
exports.initializePickupDeadlineChecker = initializePickupDeadlineChecker;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
async function checkPickupDeadlines() {
    try {
        console.log('🕐 Checking collection deadlines...');
        const now = new Date();
        // Find all approved/scheduled collections that have passed their deadline
        const expiredCollections = await models_1.Collection.findAll({
            where: {
                status: { [sequelize_1.Op.in]: ['approved', 'scheduled'] },
                [sequelize_1.Op.or]: [
                    // For scheduled collections: deadline = scheduledDate - 1 hour (which is in pickupDeadline)
                    // For unscheduled collections: deadline = requestDate + 1 hour (also in pickupDeadline)
                    { scheduledDate: { [sequelize_1.Op.and]: { [sequelize_1.Op.not]: null, [sequelize_1.Op.lte]: new Date(now.getTime() + 60 * 60 * 1000) } } },
                    // If no scheduledDate, check if requestDate + 1 hour has passed
                    {
                        [sequelize_1.Op.and]: [
                            { scheduledDate: null },
                            { requestDate: { [sequelize_1.Op.lte]: new Date(now.getTime() - 60 * 60 * 1000) } }
                        ]
                    }
                ]
            },
            include: [
                {
                    model: models_1.WastePost,
                    as: 'post',
                    attributes: ['id', 'title', 'businessId', 'collectionStatus']
                },
                {
                    model: models_1.User,
                    as: 'recycler',
                    attributes: ['id', 'email', 'companyName']
                },
                {
                    model: models_1.User,
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
                const post = collection.post;
                const recycler = collection.recycler;
                const business = collection.business;
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
                    await models_1.Notification.create({
                        userId: recycler.id,
                        type: 'COLLECTION_REQUEST',
                        title: `Collection Request Expired`,
                        message: `Your pickup window for "${post?.title}" has expired. The post is now available for other recyclers.`,
                        relatedId: post?.id
                    });
                }
                // Notify business
                if (business) {
                    await models_1.Notification.create({
                        userId: business.id,
                        type: 'COLLECTION_REQUEST',
                        title: `Collection Request Expired`,
                        message: `The recycler did not pick up "${post?.title}" within the scheduled time. It's now available for other recyclers.`,
                        relatedId: post?.id
                    });
                }
            }
            catch (error) {
                console.error(`❌ Error processing collection ${collection.id}:`, error);
            }
        }
        console.log(`✅ Processed ${expiredCollections.length} expired collection(s)`);
    }
    catch (error) {
        console.error('❌ Error checking pickup deadlines:', error);
    }
}
function initializePickupDeadlineChecker() {
    console.log('🚀 Initializing collection deadline checker (runs every 5 minutes)...');
    checkPickupDeadlines();
    setInterval(checkPickupDeadlines, 5 * 60 * 1000);
    console.log('✅ Collection deadline checker initialized');
}
exports.default = {
    checkPickupDeadlines,
    initializePickupDeadlineChecker
};
//# sourceMappingURL=pickupDeadlineService.js.map