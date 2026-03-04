"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPostRatings = exports.getAllUserRatings = exports.getUserRating = exports.getPostRating = void 0;
const models_1 = require("../models");
const getPostRating = async (req, res) => {
    try {
        const { postId } = req.params;
        const PostRating = models_1.sequelize.models.PostRating;
        const WastePost = models_1.sequelize.models.WastePost;
        const Feedback = models_1.sequelize.models.Feedback;
        const Collection = models_1.sequelize.models.Collection;
        let postRating = await PostRating.findOne({ where: { postId } });
        if (!postRating) {
            postRating = await PostRating.create({
                postId,
                averageRating: 5.0,
                totalRatings: 0,
                totalFeedback: 0
            });
        }
        const collections = await Collection.findAll({
            where: { postId },
            attributes: ['id']
        });
        const collectionIds = collections.map((c) => c.id);
        const feedbacks = await Feedback.findAll({
            where: { collectionId: collectionIds },
            include: [
                {
                    model: models_1.sequelize.models.User,
                    as: 'fromUser',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName']
                }
            ],
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({
            message: 'Post rating retrieved successfully',
            data: {
                postId,
                averageRating: postRating.averageRating,
                totalRatings: postRating.totalRatings,
                totalFeedback: postRating.totalFeedback,
                recentFeedback: feedbacks
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching post rating', error: error.message });
    }
};
exports.getPostRating = getPostRating;
const getUserRating = async (req, res) => {
    try {
        const { userId } = req.params;
        const UserRating = models_1.sequelize.models.UserRating;
        const User = models_1.sequelize.models.User;
        const Feedback = models_1.sequelize.models.Feedback;
        const Report = models_1.sequelize.models.Report;
        let userRating = await UserRating.findOne({ where: { userId } });
        if (!userRating) {
            userRating = await UserRating.create({
                userId,
                averageRating: 5.0,
                totalRatings: 0,
                totalFeedback: 0
            });
        }
        const user = await User.findByPk(userId, {
            attributes: ['id', 'email', 'type', 'businessName', 'companyName', 'isActive']
        });
        const recentFeedbacks = await Feedback.findAll({
            where: { toUserId: userId },
            include: [
                {
                    model: User,
                    as: 'fromUser',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName']
                }
            ],
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        const reportCount = await Report.count({
            where: { reportedUserId: userId, status: 'approved' }
        });
        res.status(200).json({
            message: 'User rating retrieved successfully',
            data: {
                averageRating: userRating.averageRating,
                totalRatings: userRating.totalRatings,
                totalFeedback: userRating.totalFeedback,
                reportCount: reportCount,
                user,
                recentFeedback: recentFeedbacks
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user rating', error: error.message });
    }
};
exports.getUserRating = getUserRating;
const getAllUserRatings = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'averageRating' } = req.query;
        const offset = (page - 1) * limit;
        const UserRating = models_1.sequelize.models.UserRating;
        const User = models_1.sequelize.models.User;
        const { count, rows } = await UserRating.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName', 'isActive']
                }
            ],
            order: [[sortBy, 'DESC']],
            limit: limit,
            offset
        });
        res.status(200).json({
            message: 'User ratings retrieved successfully',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user ratings', error: error.message });
    }
};
exports.getAllUserRatings = getAllUserRatings;
const getAllPostRatings = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'averageRating' } = req.query;
        const offset = (page - 1) * limit;
        const PostRating = models_1.sequelize.models.PostRating;
        const WastePost = models_1.sequelize.models.WastePost;
        const { count, rows } = await PostRating.findAndCountAll({
            include: [
                {
                    model: WastePost,
                    as: 'post',
                    attributes: ['id', 'title', 'wasteType', 'status', 'businessId']
                }
            ],
            order: [[sortBy, 'DESC']],
            limit: limit,
            offset
        });
        res.status(200).json({
            message: 'Post ratings retrieved successfully',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching post ratings', error: error.message });
    }
};
exports.getAllPostRatings = getAllPostRatings;
//# sourceMappingURL=ratingController.js.map