interface EmailLog {
    to: string;
    subject: string;
    code: string;
    timestamp: Date;
    type: 'verification' | 'password-reset' | 'verified' | 'deleted';
}
export declare const getSentEmails: () => EmailLog[];
export declare const getEmailsForRecipient: (email: string) => EmailLog[];
export declare const clearSentEmails: () => void;
export declare const sendVerificationEmail: (email: string, code: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const sendPasswordResetEmail: (email: string, code: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const sendAccountVerifiedEmail: (email: string, userName: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const sendAccountDeletedEmail: (email: string, userName: string) => Promise<{
    success: boolean;
    message: string;
}>;
export {};
//# sourceMappingURL=emailService.d.ts.map