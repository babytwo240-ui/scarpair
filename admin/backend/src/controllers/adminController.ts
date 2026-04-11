import { Request, Response } from 'express';
import { verifyCredentials, generateToken } from '../shared/config/jwt';
import { sequelize } from '../shared/db/index';
import {
  logAdminLogin,
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
  getStatistics,
  getSystemLogs,
  clearSystemLogs
};

