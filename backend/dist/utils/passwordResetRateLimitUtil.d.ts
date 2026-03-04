/**
 * RATE LIMITING UTILITY FOR PASSWORD RESETS
 * Multi-level rate limiting to prevent abuse
 */
export interface RateLimitCheckResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    reason?: string;
}
/**
 * Check password reset rate limits
 * Enforces multiple layers:
 * - Per IP: 3 attempts in 15 minutes
 * - Per Email: 5 attempts in 1 hour
 * - Per IP+Email: 2 attempts in 24 hours
 */
export declare const checkPasswordResetRateLimit: (email: string, ipAddress: string) => Promise<RateLimitCheckResult>;
/**
 * Clear rate limit for a user (after successful reset or for admin)
 */
export declare const clearPasswordResetRateLimit: (email: string, ipAddress?: string) => Promise<void>;
/**
 * Get current rate limit status for debugging/monitoring
 */
export declare const getPasswordResetRateLimitStatus: (email: string, ipAddress: string) => Promise<{
    ipAttempts: number;
    ipTtl: number;
    emailAttempts: number;
    emailTtl: number;
    comboAttempts: number;
    comboTtl: number;
}>;
//# sourceMappingURL=passwordResetRateLimitUtil.d.ts.map