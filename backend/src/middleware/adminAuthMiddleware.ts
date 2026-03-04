import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken, AdminPayload } from '../config/adminJwt';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

const authenticateAdmin = (req: Request, res: Response, next: NextFunction): any => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header is missing'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token is missing'
      });
    }

    const decoded = verifyAdminToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired admin token'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Authentication error'
    });
  }
};

export { authenticateAdmin };
export type { AdminPayload };
