"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
}));
// Create logs directory if needed (for file logging)
const logsDir = path_1.default.join(__dirname, '../../logs');
// Configure transports based on environment
const transports = [
    // Always log to console
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] [${level}] ${message}`;
        }))
    })
];
// In production, also log to file
if (process.env.NODE_ENV === 'production') {
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 5
    }), new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'combined.log'),
        format: logFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 5
    }));
}
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: transports,
    exceptionHandlers: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message, timestamp }) => {
                return `[${timestamp}] [${level}] EXCEPTION: ${message}`;
            }))
        })
    ]
});
exports.default = logger;
//# sourceMappingURL=logger.js.map