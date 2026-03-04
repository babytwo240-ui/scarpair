export declare const generateVerificationCode: () => string;
export declare const generateResetToken: () => string;
export declare const hashToken: (token: string) => string;
export declare const verifyToken: (token: string, hash: string) => boolean;
export declare const generateExpiry: (durationSeconds: number) => Date;
export declare const isExpired: (expiryDate: Date) => boolean;
//# sourceMappingURL=passwordUtil.d.ts.map