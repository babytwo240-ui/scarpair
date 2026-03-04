import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../config/userJwt';
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}
declare const authenticateUser: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export { authenticateUser };
//# sourceMappingURL=userAuthMiddleware.d.ts.map