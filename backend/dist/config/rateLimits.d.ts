export declare const rateLimitConfig: {
    typing: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        skipSuccessfulRequests: boolean;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    createConversation: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    sendMessage: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    getMessages: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    passwordReset: {
        enabled: boolean;
    };
};
export default rateLimitConfig;
//# sourceMappingURL=rateLimits.d.ts.map