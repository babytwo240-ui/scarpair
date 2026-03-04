import { Request, Response, NextFunction } from 'express';
import { AdminPayload } from '../config/jwt';
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
declare const authenticate: (req: Request, res: Response, next: NextFunction) => any;
export { authenticate };
//# sourceMappingURL=authMiddleware.d.ts.map