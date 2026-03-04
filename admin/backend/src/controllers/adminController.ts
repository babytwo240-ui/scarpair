import { Request, Response } from 'express';
import { verifyCredentials, generateToken } from '../config/jwt';
import { sequelize } from '../models';

/**
 * Admin Login
 */
const login = (req: Request, res: Response): any => {
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

    res.status(200).json({
      message: 'Login successful',
      token: token,
      admin: {
        username: username,
        role: 'admin'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all materials (Admin view)
 */
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
    console.error('Get materials error:', error.message);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

/**
 * Get material by ID
 */
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
    console.error('Get material by ID error:', error.message);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
};

/**
 * Create new material (Admin)
 */
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

    res.status(201).json({
      message: 'Material created successfully',
      data: material
    });
  } catch (error: any) {
    console.error('Create material error:', error.message);
    res.status(500).json({ error: 'Failed to create material' });
  }
};

/**
 * Update material by ID
 */
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

    res.status(200).json({
      message: 'Material updated successfully',
      data: material
    });
  } catch (error: any) {
    console.error('Update material error:', error.message);
    res.status(500).json({ error: 'Failed to update material' });
  }
};

/**
 * Delete material by ID
 */
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

    await material.destroy();

    res.status(200).json({
      message: 'Material deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete material error:', error.message);
    res.status(500).json({ error: 'Failed to delete material' });
  }
};

/**
 * Get statistics
 */
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
    console.error('Get statistics error:', error.message);
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
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
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

    res.status(201).json({
      message: 'Category created successfully',
      data: category
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
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

    res.status(200).json({
      message: 'Category updated successfully',
      data: category
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error.message });
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

    await category.destroy();

    res.status(200).json({
      message: 'Category deleted successfully',
      data: { id: categoryId }
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
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
    console.error('Error fetching user ratings:', error);
    res.status(500).json({ message: 'Error fetching user ratings', error: error.message });
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
    console.error('Error fetching post ratings:', error);
    res.status(500).json({ message: 'Error fetching post ratings', error: error.message });
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
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
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
    console.error('Error fetching system logs:', error);
    res.status(500).json({ message: 'Error fetching system logs', error: error.message });
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
  getSystemLogs
};
