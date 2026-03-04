"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPasswordResetRateLimitStatus = exports.clearPasswordResetRateLimit = exports.checkPasswordResetRateLimit = void 0;
const redis_1 = require("../config/redis");
/**
 * Check password reset rate limits
 * Enforces multiple layers:
 * - Per IP: 3 attempts in 15 minutes
 * - Per Email: 5 attempts in 1 hour
 * - Per IP+Email: 2 attempts in 24 hours
 */
const checkPasswordResetRateLimit = async (email, ipAddress) => {
    try {
        const now = Date.now();
        // Check 1: Per IP limit (3 per 15 minutes)
        const ipKey = `pwd_reset_ip:${ipAddress}`;
        const ipAttempts = await redis_1.redisClient.incr(ipKey);
        if (ipAttempts === 1) {
            await redis_1.redisClient.expire(ipKey, 15 * 60); // 15 minutes
        }
        if (ipAttempts > 3) {
            const ttl = await redis_1.redisClient.ttl(ipKey);
            return {
                allowed: false,
                remaining: 0,
                resetTime: now + ttl * 1000,
                reason: `Too many reset attempts from this IP. Try again in ${ttl} seconds.`
            };
        }
        // Check 2: Per Email limit (5 per 1 hour)
        const emailKey = `pwd_reset_email:${email}`;
        const emailAttempts = await redis_1.redisClient.incr(emailKey);
        if (emailAttempts === 1) {
            await redis_1.redisClient.expire(emailKey, 60 * 60); // 1 hour
        }
        if (emailAttempts > 5) {
            const ttl = await redis_1.redisClient.ttl(emailKey);
            return {
                allowed: false,
                remaining: 0,
                resetTime: now + ttl * 1000,
                reason: `Too many reset attempts for this email. Try again in ${ttl} seconds.`
            };
        }
        // Check 3: Per IP+Email combo (2 per 24 hours)
        const comboKey = `pwd_reset_combo:${email}:${ipAddress}`;
        const comboAttempts = await redis_1.redisClient.incr(comboKey);
        if (comboAttempts === 1) {
            await redis_1.redisClient.expire(comboKey, 24 * 60 * 60); // 24 hours
        }
        if (comboAttempts > 2) {
            const ttl = await redis_1.redisClient.ttl(comboKey);
            return {
                allowed: false,
                remaining: 0,
                resetTime: now + ttl * 1000,
                reason: `Suspicious activity detected. This account cannot reset from this location right now. Try again in ${ttl} seconds.`
            };
        }
        // All checks passed
        return {
            allowed: true,
            remaining: Math.min(3 - ipAttempts, 5 - emailAttempts, 2 - comboAttempts),
            resetTime: 0
        };
    }
    catch (error) {
        console.error('Error checking password reset rate limit:', error);
        // On error, allow the request (fail open)
        return {
            allowed: true,
            remaining: 1,
            resetTime: 0,
            reason: 'Rate limit check failed - allowing request'
        };
    }
};
exports.checkPasswordResetRateLimit = checkPasswordResetRateLimit;
/**
 * Clear rate limit for a user (after successful reset or for admin)
 */
const clearPasswordResetRateLimit = async (email, ipAddress) => {
    try {
        await redis_1.redisClient.del(`pwd_reset_email:${email}`);
        if (ipAddress) {
            await redis_1.redisClient.del(`pwd_reset_ip:${ipAddress}`);
            await redis_1.redisClient.del(`pwd_reset_combo:${email}:${ipAddress}`);
        }
        console.log(`✓ Rate limits cleared for ${email}`);
    }
    catch (error) {
        console.error('Error clearing password reset rate limit:', error);
    }
};
exports.clearPasswordResetRateLimit = clearPasswordResetRateLimit;
/**
 * Get current rate limit status for debugging/monitoring
 */
const getPasswordResetRateLimitStatus = async (email, ipAddress) => {
    try {
        const ipAttempts = await redis_1.redisClient.get(`pwd_reset_ip:${ipAddress}`);
        const emailAttempts = await redis_1.redisClient.get(`pwd_reset_email:${email}`);
        const comboAttempts = await redis_1.redisClient.get(`pwd_reset_combo:${email}:${ipAddress}`);
        const ipTtl = await redis_1.redisClient.ttl(`pwd_reset_ip:${ipAddress}`);
        const emailTtl = await redis_1.redisClient.ttl(`pwd_reset_email:${email}`);
        const comboTtl = await redis_1.redisClient.ttl(`pwd_reset_combo:${email}:${ipAddress}`);
        return {
            ipAttempts: parseInt(ipAttempts || '0'),
            ipTtl: ipTtl > 0 ? ipTtl : 0,
            emailAttempts: parseInt(emailAttempts || '0'),
            emailTtl: emailTtl > 0 ? emailTtl : 0,
            comboAttempts: parseInt(comboAttempts || '0'),
            comboTtl: comboTtl > 0 ? comboTtl : 0
        };
    }
    catch (error) {
        console.error('Error getting rate limit status:', error);
        return {
            ipAttempts: 0,
            ipTtl: 0,
            emailAttempts: 0,
            emailTtl: 0,
            comboAttempts: 0,
            comboTtl: 0
        };
    }
};
exports.getPasswordResetRateLimitStatus = getPasswordResetRateLimitStatus;
//# sourceMappingURL=passwordResetRateLimitUtil.js.map