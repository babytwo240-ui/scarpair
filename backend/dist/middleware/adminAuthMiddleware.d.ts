import { Request, Response, NextFunction } from 'express';
import { AdminPayload } from '../config/adminJwt';
declare global {
    namespace Express {
        interface Request {
            admin?: AdminPayload;
        }
    }
}
declare const authenticateAdmin: (req: Request, res: Response, next: NextFunction) => any;
export { authenticateAdmin };
export type { AdminPayload };
//# sourceMappingURL=adminAuthMiddleware.d.ts.map