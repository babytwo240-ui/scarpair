interface BusinessData {
    businessName: string;
    email: string;
    password: string;
    phone: string;
    verificationCode?: string;
    verificationCodeExpiry?: Date;
}
interface RecyclerData {
    companyName: string;
    email: string;
    password: string;
    phone: string;
    specialization?: string;
    verificationCode?: string;
    verificationCodeExpiry?: Date;
}
interface ErrorResult {
    error: string;
}
interface UserResult {
    id: number;
    type: string;
    email: string;
    businessName?: string;
    companyName?: string;
    isVerified: boolean;
    loginAttempts: number;
    isLocked: boolean;
    lockedUntil?: Date;
    [key: string]: any;
}
declare const businessEmailExists: (email: string) => Promise<boolean>;
declare const recyclerEmailExists: (email: string) => Promise<boolean>;
declare const registerBusiness: (businessData: BusinessData) => Promise<UserResult | ErrorResult>;
declare const registerRecycler: (recyclerData: RecyclerData) => Promise<UserResult | ErrorResult>;
declare const findBusinessByEmail: (email: string) => Promise<UserResult | null>;
declare const findRecyclerByEmail: (email: string) => Promise<UserResult | null>;
declare const verifyBusinessCredentials: (email: string, password: string) => Promise<boolean>;
declare const verifyRecyclerCredentials: (email: string, password: string) => Promise<boolean>;
declare const verifyUserEmail: (email: string, type: "business" | "recycler") => Promise<UserResult | ErrorResult>;
declare const incrementLoginAttempts: (email: string, type: "business" | "recycler", attempts: number) => Promise<void>;
declare const resetLoginAttempts: (email: string, type: "business" | "recycler") => Promise<void>;
declare const lockUserAccount: (email: string, type: "business" | "recycler") => Promise<void>;
declare const setPasswordResetToken: (email: string, type: "business" | "recycler", resetCode: string, resetTokenExpiry: Date) => Promise<void>;
declare const updateUserPassword: (email: string, type: "business" | "recycler", newPassword: string) => Promise<void>;
declare const updateUserProfile: (email: string, type: "business" | "recycler", updates: {
    phone?: string;
    businessName?: string;
    companyName?: string;
    specialization?: string;
}) => Promise<UserResult | ErrorResult>;
declare const deleteUserAccount: (email: string, type: "business" | "recycler") => Promise<boolean>;
declare const validateNewPassword: (email: string, type: "business" | "recycler", currentPassword: string, newPassword: string) => Promise<{
    valid: boolean;
    error?: string;
}>;
declare const validateResetPassword: (email: string, newPassword: string) => Promise<{
    valid: boolean;
    error?: string;
}>;
export { registerBusiness, registerRecycler, findBusinessByEmail, findRecyclerByEmail, verifyBusinessCredentials, verifyRecyclerCredentials, businessEmailExists, recyclerEmailExists, verifyUserEmail, incrementLoginAttempts, resetLoginAttempts, lockUserAccount, setPasswordResetToken, updateUserPassword, updateUserProfile, deleteUserAccount, validateNewPassword, validateResetPassword };
export type { BusinessData, RecyclerData, UserResult };
//# sourceMappingURL=userService.d.ts.map