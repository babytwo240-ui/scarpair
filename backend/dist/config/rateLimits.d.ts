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
    getConversations: {
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
    createWastePost: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    updateWastePost: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    createCollection: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    updateCollection: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    login: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    passwordReset: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    register: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    createMaterial: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    createReview: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    createRating: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    createFeedback: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
    getNotifications: {
        windowMs: number;
        maxPerUser: number;
        maxPerIP: number;
        keyGenerator: (userId: string, ip: string) => {
            user: string;
            ip: string;
        };
    };
};
export default rateLimitConfig;
//# sourceMappingURL=rateLimits.d.ts.map