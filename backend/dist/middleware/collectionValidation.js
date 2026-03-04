"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCollectionQuery = exports.validateScheduleCollection = exports.validateCollectionRequest = void 0;
const validateCollectionRequest = (req, res, next) => {
    const { postId } = req.body;
    const errors = [];
    if (!postId || typeof postId !== 'number' || postId <= 0) {
        errors.push('Post ID is required and must be a positive number');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors
        });
    }
    next();
};
exports.validateCollectionRequest = validateCollectionRequest;
const validateScheduleCollection = (req, res, next) => {
    const { scheduledDate } = req.body;
    const errors = [];
    if (!scheduledDate) {
        errors.push('Scheduled date is required');
    }
    else {
        const date = new Date(scheduledDate);
        if (isNaN(date.getTime())) {
            errors.push('Scheduled date must be a valid date');
        }
        else if (date <= new Date()) {
            errors.push('Scheduled date must be in the future');
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors
        });
    }
    next();
};
exports.validateScheduleCollection = validateScheduleCollection;
const validateCollectionQuery = (req, res, next) => {
    const { page, limit, wasteType, city, status } = req.query;
    const errors = [];
    if (page !== undefined) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
            errors.push('Page must be a positive number');
        }
    }
    if (limit !== undefined) {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            errors.push('Limit must be between 1 and 100');
        }
    }
    if (status !== undefined) {
        const validStatuses = ['pending', 'approved', 'scheduled', 'completed', 'confirmed'];
        if (!validStatuses.includes(status)) {
            errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors
        });
    }
    next();
};
exports.validateCollectionQuery = validateCollectionQuery;
//# sourceMappingURL=collectionValidation.js.map