"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
// Load logger based on environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = NODE_ENV === 'production'
    ? require('./logger.prod').default
    : require('./logger.dev').default;
// Custom token for response time in milliseconds
morgan_1.default.token('response-time-ms', (req, res) => {
    if (!res._header)
        return '';
    const diff = Date.now() - (req._startTime || Date.now());
    return diff.toString();
});
// HTTP request logging format
const httpLogFormat = ':method :url :status :response-time-ms ms - :res[content-length] bytes';
// Create Morgan middleware with Winston integration
const morganMiddleware = (0, morgan_1.default)(httpLogFormat, {
    stream: {
        write: (message) => {
            // Skip health checks
            if (message.includes('/api/health') || message.includes('/health')) {
                return;
            }
            // In production, skip detailed HTTP logs (keep it clean)
            if (NODE_ENV === 'production') {
                return;
            }
            // Log to Winston in development
            logger.info(message.trim());
        }
    },
    skip: (req, res) => {
        // Skip health checks and status endpoints
        return req.path === '/api/health' || req.path === '/health' || req.path === '/status';
    }
});
exports.default = morganMiddleware;
//# sourceMappingURL=morganConfig.js.map