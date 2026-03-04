import { Request, Response, NextFunction } from 'express';
import { verifyToken, AdminPayload } from '../config/jwt';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
const authenticate = (req: Request, res: Response, next: NextFunction): any => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header is missing'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token is missing'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    // Attach decoded token to request
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Authentication error'
    });
  }
};

export { authenticate };
