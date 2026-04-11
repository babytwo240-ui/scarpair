import { Request, Response } from 'express';
import { verifyCredentials, generateToken } from '../shared/config/jwt';
import { sequelize } from '../shared/db/index';
import {
  logAdminLogin,
  logMaterialCreated,
  logMaterialUpdated,
  logMaterialDeleted,
  logCategoryCreated,
  logCategoryUpdated,
  logCategoryDeleted,
  logActionFailed
} from '../shared/utils/auditLogger';

const NODE_ENV = process.env.NODE_ENV || 'development';

const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    if (!verifyCredentials(username, password)) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    const token = generateToken({
      username: username,
      role: 'admin',
      loginTime: new Date().toISOString()
    });

    // Log admin login
    await logAdminLogin(username, req);

    res.status(200).json({
      message: 'Login successful',
      token: token,
      admin: {
        username: username,
        role: 'admin'
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Login failed',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const getAllMaterials = async (req: Request, res: Response): Promise<any> => {
  try {
    const Material = (sequelize as any).models.Material;
    
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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};
const getMaterialById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const Material = (sequelize as any).models.Material;

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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch material' });
  }
};

const createMaterial = async (req: Request, res: Response): Promise<any> => {
  try {
    const { businessUserId, materialType, quantity, unit, description, contactEmail, status, isRecommendedForArtists } = req.body;

    if (!businessUserId || !materialType || !quantity || !contactEmail) {
      return res.status(400).json({
        error: 'Missing required fields: businessUserId, materialType, quantity, contactEmail'
      });
    }

    const Material = (sequelize as any).models.Material;
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
    await logMaterialCreated(
      1, // Admin ID
      material.id as any,
      material.materialType,
      material.quantity,
      req
    );

    res.status(201).json({
      message: 'Material created successfully',
      data: material
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create material' });
  }
};
const updateMaterial = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { businessUserId, materialType, quantity, unit, description, contactEmail, status, isRecommendedForArtists } = req.body;

    const Material = (sequelize as any).models.Material;
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
    await logMaterialUpdated(
      1, // Admin ID
      material.id as any,
      material.materialType,
      updateChanges,
      req
    );

    res.status(200).json({
      message: 'Material updated successfully',
      data: material
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update material' });
  }
};

const deleteMaterial = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const Material = (sequelize as any).models.Material;

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
    await logMaterialDeleted(
      1, // Admin ID
      id as any,
      materialType,
      req
    );

    res.status(200).json({
      message: 'Material deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
};
const getStatistics = async (req: Request, res: Response): Promise<any> => {
  try {
    const User = (sequelize as any).models.User;
    const Material = (sequelize as any).models.Material;

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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};

const getWasteCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const WasteCategory = (sequelize as any).models.WasteCategory;

    const categories = await WasteCategory.findAll({
      attributes: ['id', 'name', 'description', 'icon', 'isActive'],
      order: [['name', 'ASC']],
      raw: true
    });

    res.status(200).json({
      message: 'Waste categories retrieved successfully',
      data: categories
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: 'Failed to fetch categories',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const createWasteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const WasteCategory = (sequelize as any).models.WasteCategory;
    const category = await WasteCategory.create({
      name,
      description: description || '',
      icon: icon || '',
      isActive: true
    });

    // Log category creation
    await logCategoryCreated(
      1, // Admin ID
      category.id as any,
      category.name,
      req
    );

    res.status(201).json({
      message: 'Category created successfully',
      data: category
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error creating category', 
      error: 'Failed to create category',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const updateWasteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon, isActive } = req.body;

    const WasteCategory = (sequelize as any).models.WasteCategory;
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
    await logCategoryUpdated(
      1, // Admin ID
      category.id as any,
      category.name,
      categoryChanges,
      req
    );

    res.status(200).json({
      message: 'Category updated successfully',
      data: category
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error updating category', 
      error: 'Failed to update category',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const deleteWasteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { categoryId } = req.params;

    const WasteCategory = (sequelize as any).models.WasteCategory;
    const category = await WasteCategory.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryName = category.name;
    await category.destroy();

    // Log category deletion
    await logCategoryDeleted(
      1, // Admin ID
      category.id as any,
      categoryName,
      req
    );

    res.status(200).json({
      message: 'Category deleted successfully',
      data: { id: categoryId }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error deleting category', 
      error: 'Failed to delete category',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const getAllUserRatings = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const UserRating = (sequelize as any).models.UserRating;
    const User = (sequelize as any).models.User;

    const { count, rows } = await UserRating.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName', 'isActive']
        }
      ],
      order: [['averageRating', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'User ratings retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching user ratings', 
      error: 'Failed to fetch user ratings',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const getAllPostRatings = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const PostRating = (sequelize as any).models.PostRating;

    const { count, rows } = await PostRating.findAndCountAll({
      order: [['averageRating', 'DESC']],
      limit: limit as number,
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
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching post ratings', 
      error: 'Failed to fetch post ratings',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const getAllReports = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const Report = (sequelize as any).models.Report;
    const User = (sequelize as any).models.User;

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
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'Reports retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching reports', 
      error: 'Failed to fetch reports',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const getSystemLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const SystemLog = (sequelize as any).models.SystemLog;

    const { count, rows } = await SystemLog.findAndCountAll({
      order: [['timestamp', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'System logs retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching system logs', 
      error: 'Failed to fetch system logs',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const clearSystemLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const SystemLog = (sequelize as any).models.SystemLog;
    
    const deletedCount = await SystemLog.destroy({
      where: {},
      truncate: true
    });

    res.status(200).json({
      message: 'All system logs cleared successfully',
      deletedCount
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error clearing system logs', 
      error: 'Failed to clear system logs',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export {
  login,
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getStatistics,
  getWasteCategories,
  createWasteCategory,
  updateWasteCategory,
  deleteWasteCategory,
  getAllUserRatings,
  getAllPostRatings,
  getAllReports,
  getSystemLogs,
  clearSystemLogs
};

