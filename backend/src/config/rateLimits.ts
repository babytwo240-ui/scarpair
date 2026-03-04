export const rateLimitConfig = {
  typing: {
    windowMs: 1000, 
    maxPerUser: 10, 
    maxPerIP: 50, 
    skipSuccessfulRequests: false,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:typing:${userId}`,
      ip: `ratelimit:typing:ip:${ip}`
    })
  },

  createConversation: {
    windowMs: 60 * 60 * 1000, 
    maxPerUser: 10,
    maxPerIP: 50,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:conv_create:${userId}`,
      ip: `ratelimit:conv_create:ip:${ip}`
    })
  },

  sendMessage: {
    windowMs: 60 * 1000, 
    maxPerUser: 100,
    maxPerIP: 500, 
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:msg:${userId}`,
      ip: `ratelimit:msg:ip:${ip}`
    })
  },

  getConversations: {
    windowMs: 60 * 1000,
    maxPerUser: 30,
    maxPerIP: 100,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:get_conv:${userId}`,
      ip: `ratelimit:get_conv:ip:${ip}`
    })
  },

  getMessages: {
    windowMs: 60 * 1000, 
    maxPerUser: 50, 
    maxPerIP: 200,
    keyGenerator: (userId: string, ip: string) => ({
      user: `ratelimit:get_msg:${userId}`,
      ip: `ratelimit:get_msg:ip:${ip}`
    })
  },

  passwordReset: {
    // Per IP: 3 attempts in 15 minutes
    // Per Email: 5 attempts in 1 hour
    // Per IP+Email: 2 attempts in 24 hours
    // Using Redis-based rate limiting (see passwordResetRateLimitUtil.ts)
    enabled: true
  }
};

export default rateLimitConfig;
