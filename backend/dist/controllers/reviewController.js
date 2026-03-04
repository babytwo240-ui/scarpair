"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const models_1 = require("../models");
exports.ReviewController = {
    createReview: async (req, res) => {
        try {
            const { businessId, postId, rating, comment } = req.body;
            const reviewerId = req.user?.id;
            if (!reviewerId) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            if (!businessId || !rating) {
                return res.status(400).json({ message: 'Missing required fields: businessId, rating' });
            }
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            if (reviewerId === businessId) {
                return res.status(400).json({ message: 'Cannot review your own business' });
            }
            const review = await models_1.Review.create({
                businessId,
                reviewerId,
                postId: postId || null,
                rating,
                comment: comment || null
            });
            res.status(201).json({
                message: 'Review created successfully',
                data: review
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error creating review', error: error.message });
        }
    },
    getBusinessReviews: async (req, res) => {
        try {
            const { businessId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
            const offset = (pageNum - 1) * limitNum;
            const { count, rows } = await models_1.Review.findAndCountAll({
                where: { businessId },
                include: [
                    {
                        model: models_1.User,
                        as: 'reviewer',
                        attributes: ['id', 'businessName', 'email']
                    },
                    {
                        model: models_1.WastePost,
                        as: 'post',
                        attributes: ['id', 'title', 'wasteType']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: limitNum,
                offset,
                raw: false
            });
            const allReviews = await models_1.Review.findAll({
                where: { businessId },
                attributes: ['rating'],
                raw: true
            });
            const averageRating = allReviews.length > 0
                ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
                : 0;
            const totalPages = Math.ceil(count / limitNum);
            res.status(200).json({
                message: 'Business reviews retrieved',
                data: {
                    reviews: rows,
                    averageRating: parseFloat(averageRating),
                    totalReviews: count
                },
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalItems: count,
                    itemsPerPage: limitNum
                }
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error retrieving reviews', error: error.message });
        }
    },
    getBusinessRating: async (req, res) => {
        try {
            const { businessId } = req.params;
            const reviews = await models_1.Review.findAll({
                where: { businessId },
                attributes: ['rating'],
                raw: true
            });
            const averageRating = reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 0;
            res.status(200).json({
                message: 'Business rating retrieved',
                data: {
                    businessId,
                    averageRating: parseFloat(averageRating),
                    totalReviews: reviews.length
                }
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error retrieving rating', error: error.message });
        }
    },
    updateReview: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user?.id;
            const review = await models_1.Review.findByPk(reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }
            if (review.reviewerId !== userId) {
                return res.status(403).json({ message: 'You can only edit your own reviews' });
            }
            if (rating && (rating < 1 || rating > 5)) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            await review.update({
                rating: rating || review.rating,
                comment: comment !== undefined ? comment : review.comment
            });
            res.status(200).json({
                message: 'Review updated successfully',
                data: review
            });
        }
        catch (error) {
            res.status(500).json({ message: 'Error updating review', error: error.message });
        }
    },
    deleteReview: async (req, res) => {
        try {
            const { reviewId } = req.params;
            const userId = req.user?.id;
            const review = await models_1.Review.findByPk(reviewId);
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }
            if (review.reviewerId !== userId) {
                return res.status(403).json({ message: 'You can only delete your own reviews' });
            }
            await review.destroy();
            res.status(200).json({ message: 'Review deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: 'Error deleting review', error: error.message });
        }
    }
};
//# sourceMappingURL=reviewController.js.map