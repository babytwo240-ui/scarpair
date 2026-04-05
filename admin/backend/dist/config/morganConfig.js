"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = NODE_ENV === 'production'
    ? require('./logger.prod').default
    : require('./logger.dev').default;
morgan_1.default.token('response-time-ms', (req, res) => {
    if (!res._header)
        return '';
    const diff = Date.now() - (req._startTime || Date.now());
    return diff.toString();
});
const httpLogFormat = ':method :url :status :response-time-ms ms - :res[content-length] bytes';
const morganMiddleware = (0, morgan_1.default)(httpLogFormat, {
    stream: {
        write: (message) => {
            if (message.includes('/api/health') || message.includes('/health')) {
                return;
            }
            if (NODE_ENV === 'production') {
                return;
            }
            logger.info(message.trim());
        }
    },
    skip: (req, res) => {
        return req.path === '/api/health' || req.path === '/health' || req.path === '/status';
    }
});
exports.default = morganMiddleware;
//# sourceMappingURL=morganConfig.js.map