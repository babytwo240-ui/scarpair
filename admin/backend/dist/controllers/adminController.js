"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatistics = void 0;
const index_1 = require("../shared/db/index");
const NODE_ENV = process.env.NODE_ENV || 'development';
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