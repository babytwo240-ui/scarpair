"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTestData = exports.getAllReportsAdmin = exports.getAllPostRatingsAdmin = exports.getAllUserRatingsAdmin = exports.getLogsByAction = exports.getSystemLogs = exports.deleteWasteCategory = exports.updateWasteCategory = exports.getWasteCategories = exports.createWasteCategory = exports.reactivateUser = exports.deactivateUser = exports.getUserStatistics = exports.verifyUserAccount = exports.deleteUserAdmin = exports.verifyUser = exports.getUserById = exports.getAllUsers = void 0;
const emailService = __importStar(require("../services/emailService"));
const userDeletionService_1 = require("../services/userDeletionService");
const models_1 = require("../models");
const getAllUsers = async (req, res) => {
    try {
        const User = models_1.sequelize.models.User;
        const users = await User.findAll({
            attributes: [
                'id',
                'email',
                'type',
                'businessName',
                'companyName',
                'phone',
                'specialization',
                'isVerified',
                'verificationCodeExpiry',
                'createdAt',
                'updatedAt'
            ],
            raw: true
        });
        const mappedUsers = users.map((user) => ({
            id: user.id,
            email: user.email,
            type: user.type,
            name: user.type === 'business' ? user.businessName : user.companyName,
            phone: user.phone,
            specialization: user.specialization || null,
            isVerified: user.isVerified,
            verifiedAt: null,
            createdAt: user.createdAt
        }));
        res.status(200).json({
            message: 'All users retrieved successfully',
            users: mappedUsers
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const User = models_1.sequelize.models.User;
        const user = await User.findByPk(id, {
            attributes: [
                'id',
                'email',
                'type',
                'businessName',
                'companyName',
                'phone',
                'specialization',
                'isVerified',
                'isActive',
                'createdAt',
                'updatedAt'
            ]
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            message: 'User retrieved successfully',
            user: {
                id: user.id,
                email: user.email,
                type: user.type,
                name: user.type === 'business' ? user.businessName : user.companyName,
                phone: user.phone,
                specialization: user.specialization || null,
                isVerified: user.isVerified,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                businessName: user.businessName,
                companyName: user.companyName
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
};
exports.getUserById = getUserById;
const verifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;
        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ error: 'isVerified must be a boolean' });
        }
        const User = models_1.sequelize.models.User;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.isVerified = isVerified;
        if (isVerified) {
            user.verificationCode = null;
            user.verificationCodeExpiry = null;
        }
        await user.save();
        const displayName = user.type === 'business' ? user.businessName : user.companyName;
        if (isVerified) {
            await emailService.sendAccountVerifiedEmail(user.email, displayName);
        }
        res.status(200).json({
            message: `User ${isVerified ? 'verified' : 'unverified'} successfully`,
            user: {
                id: user.id,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user verification status' });
    }
};
exports.verifyUser = verifyUser;
const deleteUserAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const User = models_1.sequelize.models.User;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userType = user.type;
        const result = await (0, userDeletionService_1.deleteUserWithCascade)(userId, userType, models_1.sequelize);
        if (result.success) {
            res.status(200).json({
                message: 'User deleted successfully',
                result: {
                    deletedUserId: result.deletedUserId,
                    deletedCount: result.deletedCount
                }
            });
        }
        else {
            res.status(500).json({ error: result.message });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUserAdmin = deleteUserAdmin;
const verifyUserAccount = async (req, res) => {
    try {
        const { userId, type } = req.body;
        if (!userId || !type) {
            return res.status(400).json({ error: 'User ID and type are required' });
        }
        if (!['business', 'recycler'].includes(type)) {
            return res.status(400).json({ error: 'Invalid user type' });
        }
        let userDetails;
        if (type === 'business') {
            userDetails = (await Promise.resolve(null)) || null;
        }
        else {
            userDetails = (await Promise.resolve(null)) || null;
        }
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (userDetails.isVerified) {
            return res.status(400).json({ error: 'User is already verified' });
        }
        userDetails.isVerified = true;
        userDetails.verificationCode = undefined;
        userDetails.verificationCodeExpiry = undefined;
        const displayName = type === 'business' ? userDetails.businessName : userDetails.companyName;
        await emailService.sendAccountVerifiedEmail(userDetails.email, displayName);
        res.status(200).json({
            message: 'User account verified successfully',
            user: {
                id: userDetails.id,
                email: userDetails.email,
                type: userDetails.type,
                isVerified: true
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to verify user' });
    }
};
exports.verifyUserAccount = verifyUserAccount;
const getUserStatistics = (req, res) => {
    try {
        const stats = {
            totalBusinessUsers: 0,
            totalRecyclerUsers: 0,
            verifiedUsers: 0,
            lockedAccounts: 0
        };
        res.status(200).json({
            statistics: stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get statistics' });
    }
};
exports.getUserStatistics = getUserStatistics;
const deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user?.id;
        const User = models_1.sequelize.models.User;
        const Collection = models_1.sequelize.models.Collection;
        const SystemLog = models_1.sequelize.models.SystemLog;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isActive = false;
        await user.save();
        const activoStatuses = ['pending', 'approved', 'scheduled'];
        const collections = await Collection.findAll({
            where: {
                $or: [
                    { recyclerId: userId, status: activoStatuses },
                    { businessId: userId, status: activoStatuses }
                ]
            }
        });
        for (const collection of collections) {
            collection.status = 'cancelled';
            collection.isCancelled = true;
            collection.cancelledBy = adminId;
            collection.cancellationReason = `User ${user.type} account deactivated by admin`;
            await collection.save();
        }
        await SystemLog.create({
            userId: adminId,
            action: 'ADMIN_DEACTIVATE_USER',
            target: 'user',
            targetId: userId,
            status: 'success',
            details: JSON.stringify({ userType: user.type, email: user.email }),
            ipAddress: req.ip || 'unknown'
        });
        res.status(200).json({
            message: `User ${user.type} deactivated successfully. ${collections.length} collections cancelled.`,
            data: { userId, collectionsAffected: collections.length }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deactivating user', error: error.message });
    }
};
exports.deactivateUser = deactivateUser;
const reactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user?.id;
        const User = models_1.sequelize.models.User;
        const SystemLog = models_1.sequelize.models.SystemLog;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isActive) {
            return res.status(400).json({ message: 'User is already active' });
        }
        user.isActive = true;
        await user.save();
        await SystemLog.create({
            userId: adminId,
            action: 'ADMIN_REACTIVATE_USER',
            target: 'user',
            targetId: userId,
            status: 'success',
            details: JSON.stringify({ userType: user.type, email: user.email }),
            ipAddress: req.ip || 'unknown'
        });
        res.status(200).json({
            message: `User ${user.type} reactivated successfully`,
            data: { userId, status: 'active' }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error reactivating user', error: error.message });
    }
};
exports.reactivateUser = reactivateUser;
const createWasteCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        const adminId = req.user?.id;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        const WasteCategory = models_1.sequelize.models.WasteCategory;
        const SystemLog = models_1.sequelize.models.SystemLog;
        const existing = await WasteCategory.findOne({ where: { name: name.trim() } });
        if (existing) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        const category = await WasteCategory.create({
            name: name.trim(),
            description: description || null,
            icon: icon || null,
            isActive: true
        });
        await SystemLog.create({
            userId: adminId,
            action: 'WASTE_CATEGORY_CREATED',
            target: 'waste_category',
            targetId: category.id,
            status: 'success',
            details: JSON.stringify({ name: category.name }),
            ipAddress: req.ip || 'unknown'
        });
        res.status(201).json({
            message: 'Waste category created successfully',
            data: category
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating waste category', error: error.message });
    }
};
exports.createWasteCategory = createWasteCategory;
const getWasteCategories = async (req, res) => {
    try {
        const WasteCategory = models_1.sequelize.models.WasteCategory;
        const categories = await WasteCategory.findAll({
            order: [['name', 'ASC']]
        });
        res.status(200).json({
            message: 'Waste categories retrieved successfully',
            data: categories
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};
exports.getWasteCategories = getWasteCategories;
const updateWasteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description, icon, isActive } = req.body;
        const adminId = req.user?.id;
        const WasteCategory = models_1.sequelize.models.WasteCategory;
        const SystemLog = models_1.sequelize.models.SystemLog;
        const category = await WasteCategory.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (name && name !== category.name) {
            const existing = await WasteCategory.findOne({ where: { name } });
            if (existing) {
                return res.status(400).json({ message: 'Category name already exists' });
            }
            category.name = name;
        }
        if (description !== undefined)
            category.description = description;
        if (icon !== undefined)
            category.icon = icon;
        if (isActive !== undefined)
            category.isActive = isActive;
        await category.save();
        await SystemLog.create({
            userId: adminId,
            action: 'WASTE_CATEGORY_UPDATED',
            target: 'waste_category',
            targetId: category.id,
            status: 'success',
            details: JSON.stringify({ name: category.name }),
            ipAddress: req.ip || 'unknown'
        });
        res.status(200).json({
            message: 'Waste category updated successfully',
            data: category
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating waste category', error: error.message });
    }
};
exports.updateWasteCategory = updateWasteCategory;
const deleteWasteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const adminId = req.user?.id;
        const WasteCategory = models_1.sequelize.models.WasteCategory;
        const SystemLog = models_1.sequelize.models.SystemLog;
        const category = await WasteCategory.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        category.isActive = false;
        await category.save();
        await SystemLog.create({
            userId: adminId,
            action: 'WASTE_CATEGORY_DELETED',
            target: 'waste_category',
            targetId: category.id,
            status: 'success',
            details: JSON.stringify({ name: category.name }),
            ipAddress: req.ip || 'unknown'
        });
        res.status(200).json({
            message: 'Waste category deleted successfully (existing posts will keep this category)',
            data: { categoryId, isActive: false }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting waste category', error: error.message });
    }
};
exports.deleteWasteCategory = deleteWasteCategory;
const getSystemLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, action, userId, status } = req.query;
        const offset = (page - 1) * limit;
        const SystemLog = models_1.sequelize.models.SystemLog;
        const User = models_1.sequelize.models.User;
        const where = {};
        if (action)
            where.action = action;
        if (userId)
            where.userId = userId;
        if (status)
            where.status = status;
        const { count, rows } = await SystemLog.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName'],
                    required: false
                }
            ],
            order: [['timestamp', 'DESC']],
            limit: limit,
            offset,
            raw: false
        });
        res.status(200).json({
            message: 'System logs retrieved successfully',
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
        res.status(500).json({ message: 'Error fetching system logs', error: error.message });
    }
};
exports.getSystemLogs = getSystemLogs;
const getLogsByAction = async (req, res) => {
    try {
        const { action } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        const SystemLog = models_1.sequelize.models.SystemLog;
        const User = models_1.sequelize.models.User;
        const { count, rows } = await SystemLog.findAndCountAll({
            where: { action },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName'],
                    required: false
                }
            ],
            order: [['timestamp', 'DESC']],
            limit: limit,
            offset
        });
        res.status(200).json({
            message: `Logs for action '${action}' retrieved successfully`,
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
        res.status(500).json({ message: 'Error fetching action logs', error: error.message });
    }
};
exports.getLogsByAction = getLogsByAction;
const getAllUserRatingsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
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
            order: [['averageRating', 'DESC']],
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
exports.getAllUserRatingsAdmin = getAllUserRatingsAdmin;
const getAllPostRatingsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
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
            order: [['averageRating', 'DESC']],
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
exports.getAllPostRatingsAdmin = getAllPostRatingsAdmin;
const getAllReportsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const Report = models_1.sequelize.models.Report;
        const User = models_1.sequelize.models.User;
        const { count, rows } = await Report.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'reportedUser',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName']
                },
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset
        });
        res.status(200).json({
            message: 'Reports retrieved successfully',
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
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};
exports.getAllReportsAdmin = getAllReportsAdmin;
const seedTestData = async (req, res) => {
    try {
        const User = models_1.sequelize.models.User;
        const UserRating = models_1.sequelize.models.UserRating;
        const Report = models_1.sequelize.models.Report;
        const SystemLog = models_1.sequelize.models.SystemLog;
        // Get first 2 users
        const users = await User.findAll({ limit: 2, attributes: ['id'] });
        if (users.length < 2) {
            return res.status(400).json({ error: 'Need at least 2 users to create test data' });
        }
        const user1Id = users[0].id;
        const user2Id = users[1].id;
        // Create user ratings
        await UserRating.findOrCreate({
            where: { userId: user1Id },
            defaults: {
                userId: user1Id,
                averageRating: 4.5,
                totalRatings: 5,
                totalFeedback: 3
            }
        });
        await UserRating.findOrCreate({
            where: { userId: user2Id },
            defaults: {
                userId: user2Id,
                averageRating: 4.0,
                totalRatings: 4,
                totalFeedback: 2
            }
        });
        // Create a test report
        await Report.findOrCreate({
            where: { reportedUserId: user2Id, reporterId: user1Id },
            defaults: {
                reportedUserId: user2Id,
                reporterId: user1Id,
                reason: 'bad_behavior',
                description: 'User not responding to messages and canceling pickups',
                status: 'pending'
            }
        });
        // Create system logs
        await SystemLog.findOrCreate({
            where: { action: 'user_login', userId: user1Id },
            defaults: {
                action: 'user_login',
                userId: user1Id,
                type: 'info',
                description: 'Admin logged in successfully'
            }
        });
        await SystemLog.findOrCreate({
            where: { action: 'category_create', userId: user1Id },
            defaults: {
                action: 'category_create',
                userId: user1Id,
                type: 'info',
                description: 'New waste category created'
            }
        });
        res.status(200).json({
            message: 'Test data seeded successfully',
            data: {
                usersAffected: [user1Id, user2Id],
                created: 'User ratings, reports, and system logs'
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to seed test data', message: error.message });
    }
};
exports.seedTestData = seedTestData;
//# sourceMappingURL=adminController.js.map