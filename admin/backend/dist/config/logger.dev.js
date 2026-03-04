"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Development log format - detailed for debugging
const devLogFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
}));
// Create logs directory for file storage
const logsDir = path_1.default.join(__dirname, '../../logs');
// Development transports: console + files
const devTransports = [
    // Colorized console for development
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] [${level}] ${message}`;
        }))
    }),
    // File logging for errors
    new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        format: devLogFormat
    }),
    // File logging for all messages
    new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        format: devLogFormat
    })
];
const devLogger = winston_1.default.createLogger({
    level: 'debug',
    format: devLogFormat,
    transports: devTransports,
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'exceptions.log'),
            format: devLogFormat
        })
    ]
});
exports.default = devLogger;
//# sourceMappingURL=logger.dev.js.map