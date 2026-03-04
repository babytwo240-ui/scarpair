import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { rateLimitConfig } from '../config/rateLimits';
import redisClient from '../config/redis';

export class RateLimiter {
  static async checkLimit(
    userId: string,
    ip: string,
    limitType: 'typing' | 'createConversation' | 'sendMessage' | 'getMessages'
  ): Promise<boolean> {
    const config = rateLimitConfig[limitType];
    const keys = config.keyGenerator(userId, ip);

    try {
      const userCount = await redisClient.incr(keys.user);
      if (userCount === 1) {
        await redisClient.expire(keys.user, Math.ceil(config.windowMs / 1000));
      }

      if (userCount > config.maxPerUser) {
        return false; 
      }

      const ipCount = await redisClient.incr(keys.ip);
      if (ipCount === 1) {
        await redisClient.expire(keys.ip, Math.ceil(config.windowMs / 1000));
      }

      if (ipCount > config.maxPerIP) {
        return false;
      }

      return true; 
    } catch (error) {
      console.error('Rate limiter error:', error);
      return true;
    }
  }

  static middleware(limitType: 'typing' | 'createConversation' | 'sendMessage' | 'getMessages') {
    return async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as any).user?.id || 'anonymous';
      const ip = req.ip || 'unknown';

      const allowed = await this.checkLimit(userId, ip, limitType);

      if (!allowed) {
        const config = rateLimitConfig[limitType];
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

  static async resetLimit(
    userId: string,
    limitType: 'typing' | 'createConversation' | 'sendMessage' | 'getMessages'
  ): Promise<void> {
    const config = rateLimitConfig[limitType];
    const keys = config.keyGenerator(userId, '');

    try {
      await redisClient.del(keys.user);
    } catch (error) {
      console.error('Error resetting rate limit:', error);
    }
  }
  static async getStatus(
    userId: string,
    ip: string,
    limitType: 'typing' | 'createConversation' | 'sendMessage' | 'getMessages'
  ): Promise<{
    userCount: number;
    ipCount: number;
    maxPerUser: number;
    maxPerIP: number;
    windowMs: number;
  }> {
    const config = rateLimitConfig[limitType];
    const keys = config.keyGenerator(userId, ip);

    try {
      const userCount = parseInt((await redisClient.get(keys.user)) || '0');
      const ipCount = parseInt((await redisClient.get(keys.ip)) || '0');

      return {
        userCount,
        ipCount,
        maxPerUser: config.maxPerUser,
        maxPerIP: config.maxPerIP,
        windowMs: config.windowMs
      };
    } catch (error) {
      console.error('Error getting rate limit status:', error);
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

export default RateLimiter;
