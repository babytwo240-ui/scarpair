"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.redisClient = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    enableReadyCheck: false,
    enableOfflineQueue: false,
    ...(process.env.REDIS_SSL === 'true' && { tls: {} })
});
exports.redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
});
exports.redisClient.on('connect', () => {
    console.log('✅ Redis connected');
});
exports.redisClient.on('reconnecting', () => {
    console.warn('⚠️  Redis reconnecting...');
});
exports.default = exports.redisClient;
//# sourceMappingURL=redis.js.map