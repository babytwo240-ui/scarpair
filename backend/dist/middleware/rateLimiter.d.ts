import { Request, Response, NextFunction } from 'express';
export declare class RateLimiter {
    static checkLimit(userId: string, ip: string, limitType: 'typing' | 'createConversation' | 'sendMessage' | 'getMessages'): Promise<boolean>;
    static middleware(limitType: 'typing' | 'createConversation' | 'sendMessage' | 'getMessages'): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    static resetLimit(userId: string, limitType: 'typing' | 'createConversation' | 'sendMessage' | 'getMessages'): Promise<void>;
    static getStatus(userId: string, ip: string, limitType: 'typing' | 'createConversation' | 'sendMessage' | 'getMessages'): Promise<{
        userCount: number;
        ipCount: number;
        maxPerUser: number;
        maxPerIP: number;
        windowMs: number;
    }>;
}
export default RateLimiter;
//# sourceMappingURL=rateLimiter.d.ts.map