import { Request, Response } from 'express';
import { sequelize } from '../models';

/**
 * Get all users from database
 * Admin can filter by type (business/recycler) and verification status
 */
const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { type, verified, page = 1, limit = 10, search = '' } = req.query;

    // Query users directly from database
    const User = (sequelize as any).models.User;
    
    if (!User) {
      return res.status(500).json({ error: 'User model not initialized', debug: 'User model missing' });
    }
    const whereClause: any = {};
    
    // Build filters
    if (type) {
      whereClause.type = type;
    }

    if (verified !== undefined && verified !== '') {
      // Note: isVerified field may not exist in base migration
      // This filter is kept for future compatibility
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

    // Fetch total count
    const totalCount = await User.count({ where: whereClause });
    // Fetch paginated users
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
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
    const mappedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      type: user.type,
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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};

/**
 * Get single user details from database
 */
const getUserById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const User = (sequelize as any).models.User;

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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user details', details: error.message });
  }
};

/**
 * Toggle user verification status and notify user
 */
const toggleUserVerification = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ error: 'isVerified must be a boolean' });
    }

    const User = (sequelize as any).models.User;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update isVerified field in database
    await user.update({ isVerified });
    // Send notification to user (async, don't block response)
    const notificationMessage = isVerified
      ? 'Your account has been verified by the admin. You can now post materials and waste.'
      : 'Your account verification has been removed by the admin.';

    const notificationTitle = isVerified
      ? 'Account Verified'
      : 'Account Unverified';

    // Try to create notification on main backend (non-blocking)
    try {
      const mainBackendUrl = process.env.MAIN_BACKEND_URL;
      if (!mainBackendUrl) {
        return;
      }
      await fetch(
        `${mainBackendUrl}/api/admin/notifications`,
        {
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
        }
      );
    } catch (notificationError) {
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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user verification status', details: error.message });
  }
};

/**
 * Delete user by admin
 */
const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const User = (sequelize as any).models.User;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user.id;
    const userName = user.email;

    // Delete the user
    await user.destroy();

    res.status(200).json({
      message: 'User deleted successfully',
      result: {
        deletedUserId: userId,
        userName: userName,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
};

export {
  getAllUsers,
  getUserById,
  toggleUserVerification,
  deleteUser
};

