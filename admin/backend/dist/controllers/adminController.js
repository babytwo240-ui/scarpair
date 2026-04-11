"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSystemLogs = exports.getSystemLogs = exports.getAllReports = exports.getAllPostRatings = exports.getAllUserRatings = exports.getStatistics = exports.login = void 0;
const jwt_1 = require("../shared/config/jwt");
const index_1 = require("../shared/db/index");
const auditLogger_1 = require("../shared/utils/auditLogger");
const NODE_ENV = process.env.NODE_ENV || 'development';
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required'
            });
        }
        if (!(0, jwt_1.verifyCredentials)(username, password)) {
            return res.status(401).json({
                error: 'Invalid username or password'
            });
        }
        const token = (0, jwt_1.generateToken)({
            username: username,
            role: 'admin',
            loginTime: new Date().toISOString()
        });
        // Log admin login
        await (0, auditLogger_1.logAdminLogin)(username, req);
        res.status(200).json({
            message: 'Login successful',
            token: token,
            admin: {
                username: username,
                role: 'admin'
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Login failed',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
    }
};
exports.login = login;
const getStatistics = async (req, res) => {
    try {
        const User = index_1.sequelize.models.User;
        const Material = index_1.sequelize.models.Material;
        const userCount = User ? await User.count() : 0;
        const materialCount = Material ? await Material.count() : 0;
        res.status(200).json({
            message: 'Statistics retrieved',
            data: {
                totalUsers: userCount,
                totalMaterials: materialCount
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get statistics' });
    }
};
exports.getStatistics = getStatistics;
const getAllUserRatings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const UserRating = index_1.sequelize.models.UserRating;
        const User = index_1.sequelize.models.User;
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
        res.status(500).json({
            message: 'Error fetching user ratings',
            error: 'Failed to fetch user ratings',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
    }
};
exports.getAllUserRatings = getAllUserRatings;
const getAllPostRatings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const PostRating = index_1.sequelize.models.PostRating;
        const { count, rows } = await PostRating.findAndCountAll({
            order: [['averageRating', 'DESC']],
            limit: limit,
            offset,
            raw: true
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
        res.status(500).json({
            message: 'Error fetching post ratings',
            error: 'Failed to fetch post ratings',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
    }
};
exports.getAllPostRatings = getAllPostRatings;
const getAllReports = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const Report = index_1.sequelize.models.Report;
        const User = index_1.sequelize.models.User;
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
        res.status(500).json({
            message: 'Error fetching reports',
            error: 'Failed to fetch reports',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
    }
};
exports.getAllReports = getAllReports;
const getSystemLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        const SystemLog = index_1.sequelize.models.SystemLog;
        const { count, rows } = await SystemLog.findAndCountAll({
            order: [['timestamp', 'DESC']],
            limit: limit,
            offset
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
        res.status(500).json({
            message: 'Error fetching system logs',
            error: 'Failed to fetch system logs',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
    }
};
exports.getSystemLogs = getSystemLogs;
const clearSystemLogs = async (req, res) => {
    try {
        const SystemLog = index_1.sequelize.models.SystemLog;
        const deletedCount = await SystemLog.destroy({
            where: {},
            truncate: true
        });
        res.status(200).json({
            message: 'All system logs cleared successfully',
            deletedCount
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error clearing system logs',
            error: 'Failed to clear system logs',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
    }
};
exports.clearSystemLogs = clearSystemLogs;
//# sourceMappingURL=adminController.js.map