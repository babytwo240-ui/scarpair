import { Sequelize, Op } from 'sequelize';

export interface DeleteResult {
  success: boolean;
  deletedUserId: number;
  deletedCount: {
    user: number;
    wastePosts: number;
    collections: number;
    messages: number;
    conversations: number;
  };
  message: string;
}
export const deleteUserWithCascade = async (
  userId: number,
  userType: 'business' | 'recycler',
  sequelizeInstance: Sequelize
): Promise<DeleteResult> => {
  const transaction = await sequelizeInstance.transaction();

  try {
    const deletedCount = {
      user: 0,
      wastePosts: 0,
      collections: 0,
      messages: 0,
      conversations: 0
    };

    const models = (sequelizeInstance as any).models;
    const User = models.User;
    const WastePost = models.WastePost;
    const Collection = models.Collection;
    const Message = models.Message;
    const Conversation = models.Conversation;
    const Notification = models.Notification;

    // Step 1: Delete all notifications related to this user
    if (Notification) {
      const notificationsDeleted = await Notification.destroy({
        where: {
          [Op.or]: [
            { userId: userId },
            { senderId: userId }
          ]
        },
        transaction
      });
    }

    // Step 2: Delete messages
    if (Message) {
      const messagesDeleted = await Message.destroy({
        where: { userId: userId },
        transaction
      });
      deletedCount.messages += messagesDeleted;
    }

    // Step 3: Delete conversations
    if (Conversation) {
      const conversationsDeleted = await Conversation.destroy({
        where: {
          [Op.or]: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        },
        transaction
      });
      deletedCount.conversations += conversationsDeleted;
    }

    // Step 4: Delete all collections involving this user (regardless of status)
    if (userType === 'business') {
      // First, get all waste post IDs for this business
      const wastePostIds = await WastePost.findAll({
        where: { businessId: userId },
        attributes: ['id'],
        transaction,
        raw: true
      });

      if (wastePostIds && wastePostIds.length > 0) {
        const postIds = wastePostIds.map((p: any) => p.id);
        
        // Delete collections where this business posted the waste
        const collectionsForPostsDeleted = await Collection.destroy({
          where: { postId: postIds },
          transaction
        });
        deletedCount.collections += collectionsForPostsDeleted;
      }

      // Delete collections where this business is the collector
      const collectionsAsCollectorDeleted = await Collection.destroy({
        where: { businessId: userId },
        transaction
      });
      deletedCount.collections += collectionsAsCollectorDeleted;
    } else {
      // For recycler: delete collections where they are the collector
      const collectionsDeleted = await Collection.destroy({
        where: { recyclerId: userId },
        transaction
      });
      deletedCount.collections += collectionsDeleted;
    }

    // Step 5: Delete all waste posts (business only)
    if (userType === 'business') {
      const postsDeleted = await WastePost.destroy({
        where: { businessId: userId },
        transaction
      });
      deletedCount.wastePosts += postsDeleted;
    }

    // Step 6: Delete the user
    const userDeleted = await User.destroy({
      where: { id: userId },
      transaction
    });
    deletedCount.user = userDeleted;

    await transaction.commit();

    return {
      success: true,
      deletedUserId: userId,
      deletedCount,
      message: `User and all related data deleted successfully. Deleted: ${deletedCount.user} user, ${deletedCount.wastePosts} posts, ${deletedCount.collections} collections, ${deletedCount.messages} messages, ${deletedCount.conversations} conversations.`
    };
  } catch (error: any) {
    await transaction.rollback();
    throw {
      success: false,
      message: `Failed to delete user: ${error.message}`,
      error: error
    };
  }
};

