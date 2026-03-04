import { Sequelize } from 'sequelize';

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

    if (userType === 'business') {
      const wastePostIds = await WastePost.findAll(
        {
          where: { businessId: userId },
          attributes: ['id'],
          transaction
        },
        { raw: true }
      );

      if (wastePostIds.length > 0) {
        const postIds = wastePostIds.map((p: any) => p.id);

        const collectionsDeleted = await Collection.destroy({
          where: { postId: postIds },
          transaction
        });
        deletedCount.collections += collectionsDeleted;
        const postsDeleted = await WastePost.destroy({
          where: { businessId: userId },
          transaction
        });
        deletedCount.wastePosts += postsDeleted;
      }

      const businessCollectionsDeleted = await Collection.destroy({
        where: { businessId: userId },
        transaction
      });
      deletedCount.collections += businessCollectionsDeleted;
    }
    if (userType === 'recycler') {
      const collectionsDeleted = await Collection.destroy({
        where: { recyclerId: userId },
        transaction
      });
      deletedCount.collections += collectionsDeleted;
    }

    if (Message) {
      const messagesDeleted = await Message.destroy({
        where: { userId: userId },
        transaction
      });
      deletedCount.messages += messagesDeleted;
    }

    if (Conversation) {
      const conversationsDeleted = await Conversation.destroy({
        where: {
          or: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        },
        transaction
      });
      deletedCount.conversations += conversationsDeleted;
    }

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

    console.error('User deletion service error:', error);

    throw {
      success: false,
      message: `Failed to delete user: ${error.message}`,
      error: error
    };
  }
};
