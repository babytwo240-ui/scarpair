"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatistics = exports.login = void 0;
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
//# sourceMappingURL=adminController.js.map