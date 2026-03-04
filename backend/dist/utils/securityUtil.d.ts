export declare const shouldLockAccount: (loginAttempts: number, maxAttempts?: number) => boolean;
export declare const isAccountLocked: (isLocked: boolean, lockedUntil: Date | null) => boolean;
export declare const getLockDurationMs: () => number;
export declare const calculateUnlockTime: () => Date;
export declare const getLockedAccountMessage: (lockedUntil: Date) => string;
//# sourceMappingURL=securityUtil.d.ts.map