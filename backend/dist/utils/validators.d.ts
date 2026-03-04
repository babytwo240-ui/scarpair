export declare const isValidEmail: (email: string) => boolean;
export declare const isValidPhone: (phone: string) => boolean;
export declare const isStrongPassword: (password: string) => {
    valid: boolean;
    errors: string[];
};
export declare const validateRequiredFields: (data: Record<string, any>, requiredFields: string[]) => {
    valid: boolean;
    missingFields: string[];
};
export declare const sanitizeInput: (input: string) => string;
//# sourceMappingURL=validators.d.ts.map