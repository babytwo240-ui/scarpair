"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const logger = process.env.NODE_ENV === 'production'
    ? require('./logger.prod').default
    : require('./logger.dev').default;
morgan_1.default.token('response-time-ms', (req, res) => {
    if (!res._header || !req._startTime)
        return '0ms';
    return `${Date.now() - req._startTime}ms`;
});
const stream = {
    write: (message) => {
        if (process.env.NODE_ENV === 'production') {
            return;
        }
        logger.info(message.trim());
    }
};
const morganMiddleware = (0, morgan_1.default)(':method :url :status :response-time-ms - :res[content-length] bytes', {
    stream: stream,
    skip: (req) => {
        return req.path === '/api/health' || req.path === '/health';
    }
});
exports.default = morganMiddleware;
//# sourceMappingURL=morganConfig.js.map