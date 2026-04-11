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

export {
  login,
  getStatistics
};

