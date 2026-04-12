"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRedisConnection = checkRedisConnection;
const ioredis_1 = __importDefault(require("ioredis"));
async function checkRedisConnection() {
    const testOptions = {
        retryStrategy: () => null,
        enableReadyCheck: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        commandTimeout: 5000,
        ...(process.env.REDIS_SSL === 'true' && { tls: {} })
    };
    const testRedis = process.env.REDIS_URL
        ? new ioredis_1.default(process.env.REDIS_URL, testOptions)
        : new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            ...testOptions
        });
    testRedis.on('error', () => {
    });
    try {
        const response = await testRedis.ping();
        if (response === 'PONG') {
            await testRedis.quit();
            return;
        }
        else {
            throw new Error('Redis PING did not return PONG');
        }
    }
    catch (error) {
        await testRedis.quit().catch(() => { });
        throw error;
    }
}
exports.default = checkRedisConnection;
//# sourceMappingURL=redisHealth.js.map