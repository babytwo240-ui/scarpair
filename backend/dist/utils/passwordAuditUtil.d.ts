import { Request } from 'express';
/**
 * UTILITY FOR PASSWORD AUDIT LOGGING
 * Tracks all password changes for security auditing
 */
export declare const getClientIp: (req: Request) => string;
export declare const getUserAgent: (req: Request) => string;
export declare const logPasswordAudit: (userId: number, email: string, type: "business" | "recycler", changeType: "reset" | "change", req: Request, status?: "success" | "failed", reason?: string) => Promise<void>;
export declare const getPasswordChangeHistory: (userId: number, limit?: number) => Promise<any>;
export declare const getRecentPasswordResetAttempts: (email: string, minutesBack?: number) => Promise<any>;
export declare const countFailedPasswordAttempts: (email: string, minutesBack?: number) => Promise<number>;
//# sourceMappingURL=passwordAuditUtil.d.ts.map