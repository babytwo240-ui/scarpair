"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTokenFromBlacklist = exports.isTokenBlacklisted = exports.blacklistToken = void 0;
const redis_1 = __importDefault(require("../config/redis"));
/**
 * Blacklist a token (invalidate it on logout)
 * Token stays blacklisted for duration matching JWT expiry
 * @param token JWT token to blacklist
 * @param expiryTime Duration in seconds (default: 7 days)
 */
const blacklistToken = async (token, expiryTime = 7 * 24 * 60 * 60) => {
    const key = `blacklist:${token}`;
    try {
        // Store token in Redis with expiry to match JWT expiry
        await redis_1.default.setex(key, expiryTime, 'true');
        console.log(`✅ Token blacklisted (expires in ${expiryTime}s)`);
    }
    catch (error) {
        console.error('❌ Error blacklisting token:', error);
        // Don't crash - fallback to normal operation
        throw error;
    }
};
exports.blacklistToken = blacklistToken;
/**
 * Check if a token is blacklisted
 * @param token JWT token to check
 * @returns true if token is blacklisted, false otherwise
 */
const isTokenBlacklisted = async (token) => {
    const key = `blacklist:${token}`;
    try {
        const exists = await redis_1.default.exists(key);
        return exists === 1;
    }
    catch (error) {
        console.error('❌ Error checking token blacklist:', error);
        // If Redis fails, don't block user - fallback to accepting token
        return false;
    }
};
exports.isTokenBlacklisted = isTokenBlacklisted;
/**
 * Clear a token from blacklist (rarely needed)
 * @param token JWT token to remove from blacklist
 */
const removeTokenFromBlacklist = async (token) => {
    const key = `blacklist:${token}`;
    try {
        await redis_1.default.del(key);
        console.log(`✅ Token removed from blacklist`);
    }
    catch (error) {
        console.error('❌ Error removing token from blacklist:', error);
    }
};
exports.removeTokenFromBlacklist = removeTokenFromBlacklist;
//# sourceMappingURL=tokenBlacklistService.js.map