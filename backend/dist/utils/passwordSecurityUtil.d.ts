/**
 * SECURITY UTILITY FOR PASSWORD HISTORY
 * Prevents users from reusing old passwords
 */
export declare const addPasswordToHistory: (currentPasswordHash: string, passwordHistory: string | null) => string;
export declare const isPasswordInHistory: (newPassword: string, passwordHistory: string | null) => Promise<boolean>;
export declare const getPasswordHistoryInfo: (passwordHistory: string | null) => number;
export declare const clearPasswordHistory: () => string;
//# sourceMappingURL=passwordSecurityUtil.d.ts.map