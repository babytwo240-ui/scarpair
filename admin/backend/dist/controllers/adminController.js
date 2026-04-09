"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubscriptions = exports.rejectSubscription = exports.activateSubscription = exports.getPendingSubscriptions = exports.getSystemLogs = exports.getAllReports = exports.getAllPostRatings = exports.getAllUserRatings = exports.deleteWasteCategory = exports.updateWasteCategory = exports.createWasteCategory = exports.getWasteCategories = exports.getStatistics = exports.deleteMaterial = exports.updateMaterial = exports.createMaterial = exports.getMaterialById = exports.getAllMaterials = exports.login = void 0;
const jwt_1 = require("../config/jwt");
const models_1 = require("../models");
const login = (req, res) => {
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
        res.status(500).json({ error: error.message });
    }
};
exports.login = login;
const getAllMaterials = async (req, res) => {
    try {
        const Material = models_1.sequelize.models.Material;
        if (!Material) {
            return res.status(500).json({ error: 'Material model not initialized' });
        }
        const materials = await Material.findAll({
            attributes: ['id', 'businessUserId', 'materialType', 'quantity', 'unit', 'description', 'contactEmail', 'status', 'isRecommendedForArtists', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']],
            raw: true
        });
        res.status(200).json({
            message: 'All materials retrieved',
            count: materials.length,
            data: materials
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
};
exports.getAllMaterials = getAllMaterials;
const getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;
        const Material = models_1.sequelize.models.Material;
        if (!Material) {
            return res.status(500).json({ error: 'Material model not initialized' });
        }
        const material = await Material.findByPk(id, {
            raw: true
        });
        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }
        res.status(200).json({
            message: 'Material retrieved',
            data: material
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch material' });
    }
};
exports.getMaterialById = getMaterialById;
const createMaterial = async (req, res) => {
    try {
        const { businessUserId, materialType, quantity, unit, description, contactEmail, status, isRecommendedForArtists } = req.body;
        if (!businessUserId || !materialType || !quantity || !contactEmail) {
            return res.status(400).json({
                error: 'Missing required fields: businessUserId, materialType, quantity, contactEmail'
            });
        }
        const Material = models_1.sequelize.models.Material;
        if (!Material) {
            return res.status(500).json({ error: 'Material model not initialized' });
        }
        const material = await Material.create({
            businessUserId,
            materialType,
            quantity,
            unit: unit || 'kg',
            description,
            contactEmail,
            status: status || 'available',
            isRecommendedForArtists: isRecommendedForArtists || false
        });
        res.status(201).json({
            message: 'Material created successfully',
            data: material
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create material' });
    }
};
exports.createMaterial = createMaterial;
const updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { businessUserId, materialType, quantity, unit, description, contactEmail, status, isRecommendedForArtists } = req.body;
        const Material = models_1.sequelize.models.Material;
        if (!Material) {
            return res.status(500).json({ error: 'Material model not initialized' });
        }
        const material = await Material.findByPk(id);
        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }
        await material.update({
            businessUserId: businessUserId || material.businessUserId,
            materialType: materialType || material.materialType,
            quantity: quantity || material.quantity,
            unit: unit || material.unit,
            description: description || material.description,
            contactEmail: contactEmail || material.contactEmail,
            status: status || material.status,
            isRecommendedForArtists: isRecommendedForArtists !== undefined ? isRecommendedForArtists : material.isRecommendedForArtists
        });
        res.status(200).json({
            message: 'Material updated successfully',
            data: material
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update material' });
    }
};
exports.updateMaterial = updateMaterial;
const deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const Material = models_1.sequelize.models.Material;
        if (!Material) {
            return res.status(500).json({ error: 'Material model not initialized' });
        }
        const material = await Material.findByPk(id);
        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }
        await material.destroy();
        res.status(200).json({
            message: 'Material deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete material' });
    }
};
exports.deleteMaterial = deleteMaterial;
const getStatistics = async (req, res) => {
    try {
        const User = models_1.sequelize.models.User;
        const Material = models_1.sequelize.models.Material;
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
const getWasteCategories = async (req, res) => {
    try {
        const WasteCategory = models_1.sequelize.models.WasteCategory;
        const categories = await WasteCategory.findAll({
            attributes: ['id', 'name', 'description', 'icon', 'isActive'],
            order: [['name', 'ASC']],
            raw: true
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
const createWasteCategory = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const WasteCategory = models_1.sequelize.models.WasteCategory;
        const category = await WasteCategory.create({
            name,
            description: description || '',
            icon: icon || '',
            isActive: true
        });
        res.status(201).json({
            message: 'Category created successfully',
            data: category
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};
exports.createWasteCategory = createWasteCategory;
const updateWasteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description, icon, isActive } = req.body;
        const WasteCategory = models_1.sequelize.models.WasteCategory;
        const category = await WasteCategory.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        await category.update({
            name: name || category.name,
            description: description !== undefined ? description : category.description,
            icon: icon !== undefined ? icon : category.icon,
            isActive: isActive !== undefined ? isActive : category.isActive
        });
        res.status(200).json({
            message: 'Category updated successfully',
            data: category
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating category', error: error.message });
    }
};
exports.updateWasteCategory = updateWasteCategory;
const deleteWasteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const WasteCategory = models_1.sequelize.models.WasteCategory;
        const category = await WasteCategory.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        await category.destroy();
        res.status(200).json({
            message: 'Category deleted successfully',
            data: { id: categoryId }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};
exports.deleteWasteCategory = deleteWasteCategory;
const getAllUserRatings = async (req, res) => {
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
exports.getAllUserRatings = getAllUserRatings;
const getAllPostRatings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const PostRating = models_1.sequelize.models.PostRating;
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
        res.status(500).json({ message: 'Error fetching post ratings', error: error.message });
    }
};
exports.getAllPostRatings = getAllPostRatings;
const getAllReports = async (req, res) => {
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
exports.getAllReports = getAllReports;
const getSystemLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        const SystemLog = models_1.sequelize.models.SystemLog;
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
        res.status(500).json({ message: 'Error fetching system logs', error: error.message });
    }
};
exports.getSystemLogs = getSystemLogs;
const getPendingSubscriptions = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const Subscription = models_1.sequelize.models.Subscription;
        const User = models_1.sequelize.models.User;
        if (!Subscription) {
            return res.status(500).json({ error: 'Subscription model not initialized' });
        }
        const { count, rows } = await Subscription.findAndCountAll({
            where: { status: 'pending' },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset
        });
        res.status(200).json({
            message: 'Pending subscriptions retrieved',
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
        res.status(500).json({ message: 'Error fetching pending subscriptions', error: error.message });
    }
};
exports.getPendingSubscriptions = getPendingSubscriptions;
const activateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const Subscription = models_1.sequelize.models.Subscription;
        const User = models_1.sequelize.models.User;
        const Notification = models_1.sequelize.models.Notification;
        if (!Subscription) {
            return res.status(500).json({ error: 'Subscription model not initialized' });
        }
        const subscription = await Subscription.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName']
                }
            ]
        });
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        if (subscription.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending subscriptions can be activated' });
        }
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        subscription.status = 'active';
        subscription.activatedAt = now;
        subscription.expiresAt = expiresAt;
        await subscription.save();
        // Notify the user
        if (Notification) {
            const userType = subscription.user?.type || 'user';
            await Notification.create({
                userId: subscription.userId,
                type: 'VERIFICATION',
                title: 'Subscription Activated! 🎉',
                message: `Your subscription has been activated! You now have +10 additional ${userType === 'business' ? 'posts' : 'views'} per day. Expires on ${expiresAt.toLocaleDateString()}.`,
                relatedId: subscription.id,
                read: false
            });
        }
        res.status(200).json({
            message: 'Subscription activated successfully',
            data: subscription
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error activating subscription', error: error.message });
    }
};
exports.activateSubscription = activateSubscription;
const rejectSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const Subscription = models_1.sequelize.models.Subscription;
        const Notification = models_1.sequelize.models.Notification;
        if (!Subscription) {
            return res.status(500).json({ error: 'Subscription model not initialized' });
        }
        const subscription = await Subscription.findByPk(id);
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        if (subscription.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending subscriptions can be rejected' });
        }
        subscription.status = 'cancelled';
        await subscription.save();
        // Notify the user
        if (Notification) {
            await Notification.create({
                userId: subscription.userId,
                type: 'VERIFICATION',
                title: 'Subscription Request Declined',
                message: `Your subscription request was not approved. ${reason ? `Reason: ${reason}` : 'Please contact support for details.'}`,
                relatedId: subscription.id,
                read: false
            });
        }
        res.status(200).json({
            message: 'Subscription rejected',
            data: subscription
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error rejecting subscription', error: error.message });
    }
};
exports.rejectSubscription = rejectSubscription;
const getAllSubscriptions = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;
        const Subscription = models_1.sequelize.models.Subscription;
        const User = models_1.sequelize.models.User;
        if (!Subscription) {
            return res.status(500).json({ error: 'Subscription model not initialized' });
        }
        const where = {};
        if (status)
            where.status = status;
        const { count, rows } = await Subscription.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset
        });
        res.status(200).json({
            message: 'Subscriptions retrieved',
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
        res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
    }
};
exports.getAllSubscriptions = getAllSubscriptions;
//# sourceMappingURL=adminController.js.map