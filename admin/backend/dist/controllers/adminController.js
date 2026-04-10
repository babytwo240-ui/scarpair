"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSystemLogs = exports.getSystemLogs = exports.getAllReports = exports.getAllPostRatings = exports.getAllUserRatings = exports.deleteWasteCategory = exports.updateWasteCategory = exports.createWasteCategory = exports.getWasteCategories = exports.getStatistics = exports.deleteMaterial = exports.updateMaterial = exports.createMaterial = exports.getMaterialById = exports.getAllMaterials = exports.login = void 0;
const jwt_1 = require("../config/jwt");
const models_1 = require("../models");
const auditLogger_1 = require("../utils/auditLogger");
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
        // Log material creation
        await (0, auditLogger_1.logMaterialCreated)(1, // Admin ID
        material.id, material.materialType, material.quantity, req);
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
        // Log material update
        const updateChanges = {
            businessUserId: businessUserId !== undefined,
            materialType: materialType !== undefined,
            quantity: quantity !== undefined,
            status: status !== undefined,
            isRecommendedForArtists: isRecommendedForArtists !== undefined
        };
        await (0, auditLogger_1.logMaterialUpdated)(1, // Admin ID
        material.id, material.materialType, updateChanges, req);
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
        const materialType = material.materialType;
        await material.destroy();
        // Log material deletion
        await (0, auditLogger_1.logMaterialDeleted)(1, // Admin ID
        id, materialType, req);
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
        res.status(500).json({
            message: 'Error fetching categories',
            error: 'Failed to fetch categories',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
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
        // Log category creation
        await (0, auditLogger_1.logCategoryCreated)(1, // Admin ID
        category.id, category.name, req);
        res.status(201).json({
            message: 'Category created successfully',
            data: category
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error creating category',
            error: 'Failed to create category',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
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
        // Log category update
        const categoryChanges = {
            name: name !== undefined,
            description: description !== undefined,
            icon: icon !== undefined,
            isActive: isActive !== undefined
        };
        await (0, auditLogger_1.logCategoryUpdated)(1, // Admin ID
        category.id, category.name, categoryChanges, req);
        res.status(200).json({
            message: 'Category updated successfully',
            data: category
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error updating category',
            error: 'Failed to update category',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
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
        const categoryName = category.name;
        await category.destroy();
        // Log category deletion
        await (0, auditLogger_1.logCategoryDeleted)(1, // Admin ID
        category.id, categoryName, req);
        res.status(200).json({
            message: 'Category deleted successfully',
            data: { id: categoryId }
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error deleting category',
            error: 'Failed to delete category',
            ...(NODE_ENV === 'development' && { details: error.message })
        });
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
        const SystemLog = models_1.sequelize.models.SystemLog;
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