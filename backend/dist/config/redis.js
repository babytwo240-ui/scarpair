"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redisOptions = {
    retryStrategy: (times) => {
        if (times > 10) {
            return -1;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    enableReadyCheck: false,
    enableOfflineQueue: false,
    ...(process.env.REDIS_SSL === 'true' && { tls: {} })
};
// If REDIS_URL is provided (Render KV Store), use it; otherwise use individual vars
exports.redisClient = process.env.REDIS_URL
    ? new ioredis_1.default(process.env.REDIS_URL, redisOptions)
    : new ioredis_1.default({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        ...redisOptions
    });
exports.redisClient.on('error', (err) => {
});
exports.redisClient.on('connect', () => {
});
exports.redisClient.on('reconnecting', () => {
});
exports.default = exports.redisClient;
//# sourceMappingURL=redis.js.map