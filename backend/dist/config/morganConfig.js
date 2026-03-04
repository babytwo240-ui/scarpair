"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
// Dynamically load the appropriate logger based on environment
const logger = process.env.NODE_ENV === 'production'
    ? require('./logger.prod').default
    : require('./logger.dev').default;
// Custom Morgan token for response time
morgan_1.default.token('response-time-ms', (req, res) => {
    if (!res._header || !req._startTime)
        return '0ms';
    return `${Date.now() - req._startTime}ms`;
});
// Create a stream for Morgan to write to Winston logger
const stream = {
    write: (message) => {
        // In production, only log if level is warn or higher
        if (process.env.NODE_ENV === 'production') {
            // Skip HTTP logs in production (too verbose)
            return;
        }
        logger.info(message.trim());
    }
};
// Configure Morgan with custom format
const morganMiddleware = (0, morgan_1.default)(':method :url :status :response-time-ms - :res[content-length] bytes', {
    stream: stream,
    skip: (req) => {
        // Skip logging for health checks in both dev and prod
        return req.path === '/api/health' || req.path === '/health';
    }
});
exports.default = morganMiddleware;
//# sourceMappingURL=morganConfig.js.map