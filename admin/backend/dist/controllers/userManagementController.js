"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.toggleUserVerification = exports.getUserById = exports.getAllUsers = void 0;
const models_1 = require("../models");
const auditLogger_1 = require("../utils/auditLogger");
const NODE_ENV = process.env.NODE_ENV || 'development';
const getAllUsers = async (req, res) => {
    try {
        const { type, verified, page = 1, limit = 10, search = '' } = req.query;
        const User = models_1.sequelize.models.User;
        if (!User) {
            return res.status(500).json({ error: 'User model not initialized' });
        }
        const whereClause = {};
        if (type) {
            whereClause.type = type;
        }
        if (verified !== undefined && verified !== '') {
            const isVerified = verified === 'true';
            whereClause['isVerified'] = isVerified;
        }
        if (search) {
            const { Op } = require('sequelize');
            whereClause[Op.or] = [
                { email: { [Op.iLike]: `%${search}%` } },
                { businessName: { [Op.iLike]: `%${search}%` } },
                { companyName: { [Op.iLike]: `%${search}%` } }
            ];
        }
        const totalCount = await User.count({ where: whereClause });
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        const users = await User.findAll({
            where: whereClause,
            attributes: [
                'id',
                'email',
                'type',
                'businessName',
                'companyName',
                'phone',
                'specialization',
                'isActive',
                'isVerified',
                'createdAt',
                'updatedAt'
            ],
            offset: offset,
            limit: limitNum,
            raw: true,
            order: [['createdAt', 'DESC']]
        });
        const mappedUsers = users.map((user) => ({
            id: user.id,
            email: user.email,
            type: user.type || 'business',
            name: user.type === 'business' ? user.businessName : user.companyName,
            phone: user.phone,
            specialization: user.specialization || null,
            isActive: user.isActive,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));
        res.status(200).json({
            message: 'Users retrieved successfully',
            users: mappedUsers,
            total: totalCount,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(totalCount / limitNum)
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch users',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
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
                'isActive',
                'isVerified',
                'createdAt',
                'updatedAt'
            ],
            raw: true
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            message: 'User details retrieved successfully',
            user: {
                id: user.id,
                email: user.email,
                type: user.type,
                name: user.type === 'business' ? user.businessName : user.companyName,
                phone: user.phone,
                specialization: user.specialization || null,
                isActive: user.isActive,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                businessName: user.businessName,
                companyName: user.companyName
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch user details',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
    }
};
exports.getUserById = getUserById;
const toggleUserVerification = async (req, res) => {
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
        await user.update({ isVerified });
        // Log user verification change
        const adminUsername = req?.admin?.username || 'admin';
        await (0, auditLogger_1.logUserVerified)(1, // Admin ID (from JWT if available)
        user.id, isVerified, user.email, req);
        const notificationMessage = isVerified
            ? 'Your account has been verified by the admin. You can now post materials and waste.'
            : 'Your account verification has been removed by the admin.';
        const notificationTitle = isVerified
            ? 'Account Verified'
            : 'Account Unverified';
        try {
            const mainBackendUrl = process.env.MAIN_BACKEND_URL;
            if (!mainBackendUrl) {
                return;
            }
            await fetch(`${mainBackendUrl}/api/admin/notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Key': process.env.ADMIN_NOTIFICATION_KEY || 'admin-secret'
                },
                body: JSON.stringify({
                    userId: id,
                    type: 'VERIFICATION',
                    title: notificationTitle,
                    message: notificationMessage
                })
            });
        }
        catch (notificationError) {
        }
        res.status(200).json({
            message: 'User verification status updated successfully',
            user: {
                id: user.id,
                email: user.email,
                type: user.type,
                name: user.type === 'business' ? user.businessName : user.companyName,
                isVerified: user.isVerified
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to update user verification status',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
    }
};
exports.toggleUserVerification = toggleUserVerification;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const User = models_1.sequelize.models.User;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userId = user.id;
        const userName = user.email;
        const userType = user.type;
        await user.destroy();
        // Log user deletion
        const adminUsername = req?.admin?.username || 'admin';
        await (0, auditLogger_1.logUserDeleted)(1, // Admin ID (from JWT if available)
        userId, userName, userType, req);
        res.status(200).json({
            message: 'User deleted successfully',
            result: {
                deletedUserId: userId,
                userName: userName,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to delete user',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userManagementController.js.map