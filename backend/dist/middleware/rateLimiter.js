"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
const rateLimits_1 = require("../config/rateLimits");
const redis_1 = __importDefault(require("../config/redis"));
class RateLimiter {
    static async checkLimit(userId, ip, limitType) {
        const config = rateLimits_1.rateLimitConfig[limitType];
        if (!config) {
            console.warn(`Unknown rate limit type: ${limitType}`);
            return true;
        }
        const keys = config.keyGenerator(userId, ip);
        try {
            const userCount = await redis_1.default.incr(keys.user);
            if (userCount === 1) {
                await redis_1.default.expire(keys.user, Math.ceil(config.windowMs / 1000));
            }
            if (userCount > config.maxPerUser) {
                return false;
            }
            const ipCount = await redis_1.default.incr(keys.ip);
            if (ipCount === 1) {
                await redis_1.default.expire(keys.ip, Math.ceil(config.windowMs / 1000));
            }
            if (ipCount > config.maxPerIP) {
                return false;
            }
            return true;
        }
        catch (error) {
            return true;
        }
    }
    static middleware(limitType) {
        return async (req, res, next) => {
            const userId = req.user?.id || 'anonymous';
            const ip = req.ip || 'unknown';
            const allowed = await this.checkLimit(userId, ip, limitType);
            if (!allowed) {
                const config = rateLimits_1.rateLimitConfig[limitType];
                return res.status(429).json({
                    error: 'Too many requests',
                    message: `Rate limit exceeded for ${limitType}`,
                    retryAfter: Math.ceil(config.windowMs / 1000),
                    limit: {
                        maxPerUser: config.maxPerUser,
                        windowMs: config.windowMs
                    }
                });
            }
            return next();
        };
    }
    static async resetLimit(userId, limitType) {
        const config = rateLimits_1.rateLimitConfig[limitType];
        if (!config)
            return;
        const keys = config.keyGenerator(userId, '');
        try {
            await redis_1.default.del(keys.user);
        }
        catch (error) {
            console.error(`Failed to reset limit ${limitType}:`, error);
        }
    }
    static async getStatus(userId, ip, limitType) {
        const config = rateLimits_1.rateLimitConfig[limitType];
        if (!config) {
            return {
                userCount: 0,
                ipCount: 0,
                maxPerUser: 0,
                maxPerIP: 0,
                windowMs: 0
            };
        }
        const keys = config.keyGenerator(userId, ip);
        try {
            const userCount = parseInt((await redis_1.default.get(keys.user)) || '0');
            const ipCount = parseInt((await redis_1.default.get(keys.ip)) || '0');
            return {
                userCount,
                ipCount,
                maxPerUser: config.maxPerUser,
                maxPerIP: config.maxPerIP,
                windowMs: config.windowMs
            };
        }
        catch (error) {
            return {
                userCount: 0,
                ipCount: 0,
                maxPerUser: config.maxPerUser,
                maxPerIP: config.maxPerIP,
                windowMs: config.windowMs
            };
        }
    }
}
exports.RateLimiter = RateLimiter;
exports.default = RateLimiter;
//# sourceMappingURL=rateLimiter.js.map