import { Request, Response, NextFunction } from 'express';
import { rateLimitConfig } from '../config/rateLimits';
export type LimitType = keyof typeof rateLimitConfig;
export declare class RateLimiter {
    static checkLimit(userId: string, ip: string, limitType: LimitType): Promise<boolean>;
    static middleware(limitType: LimitType): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    static resetLimit(userId: string, limitType: LimitType): Promise<void>;
    static getStatus(userId: string, ip: string, limitType: LimitType): Promise<{
        userCount: number;
        ipCount: number;
        maxPerUser: number;
        maxPerIP: number;
        windowMs: number;
    }>;
}
export default RateLimiter;
//# sourceMappingURL=rateLimiter.d.ts.map