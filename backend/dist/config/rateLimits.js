"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitConfig = void 0;
exports.rateLimitConfig = {
    typing: {
        windowMs: 1000,
        maxPerUser: 10,
        maxPerIP: 50,
        skipSuccessfulRequests: false,
        keyGenerator: (userId, ip) => ({
            user: `ratelimit:typing:${userId}`,
            ip: `ratelimit:typing:ip:${ip}`
        })
    },
    createConversation: {
        windowMs: 60 * 60 * 1000,
        maxPerUser: 10,
        maxPerIP: 50,
        keyGenerator: (userId, ip) => ({
            user: `ratelimit:conv_create:${userId}`,
            ip: `ratelimit:conv_create:ip:${ip}`
        })
    },
    sendMessage: {
        windowMs: 60 * 1000,
        maxPerUser: 100,
        maxPerIP: 500,
        keyGenerator: (userId, ip) => ({
            user: `ratelimit:msg:${userId}`,
            ip: `ratelimit:msg:ip:${ip}`
        })
    },
    getConversations: {
        windowMs: 60 * 1000,
        maxPerUser: 30,
        maxPerIP: 100,
        keyGenerator: (userId, ip) => ({
            user: `ratelimit:get_conv:${userId}`,
            ip: `ratelimit:get_conv:ip:${ip}`
        })
    },
    getMessages: {
        windowMs: 60 * 1000,
        maxPerUser: 50,
        maxPerIP: 200,
        keyGenerator: (userId, ip) => ({
            user: `ratelimit:get_msg:${userId}`,
            ip: `ratelimit:get_msg:ip:${ip}`
        })
    },
    passwordReset: {
        enabled: true
    }
};
exports.default = exports.rateLimitConfig;
//# sourceMappingURL=rateLimits.js.map