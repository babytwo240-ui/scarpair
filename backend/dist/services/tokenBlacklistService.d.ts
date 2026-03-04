/**
 * Blacklist a token (invalidate it on logout)
 * Token stays blacklisted for duration matching JWT expiry
 * @param token JWT token to blacklist
 * @param expiryTime Duration in seconds (default: 7 days)
 */
export declare const blacklistToken: (token: string, expiryTime?: number) => Promise<void>;
/**
 * Check if a token is blacklisted
 * @param token JWT token to check
 * @returns true if token is blacklisted, false otherwise
 */
export declare const isTokenBlacklisted: (token: string) => Promise<boolean>;
/**
 * Clear a token from blacklist (rarely needed)
 * @param token JWT token to remove from blacklist
 */
export declare const removeTokenFromBlacklist: (token: string) => Promise<void>;
//# sourceMappingURL=tokenBlacklistService.d.ts.map