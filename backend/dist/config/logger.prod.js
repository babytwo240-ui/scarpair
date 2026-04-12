"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const prodLogFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
}));
const prodTransports = [
    new winston_1.default.transports.Console({
        format: prodLogFormat
    })
];
const prodLogger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'warn',
    format: prodLogFormat,
    transports: prodTransports,
    exceptionHandlers: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.printf(({ level, message, timestamp, stack }) => {
                return `[${timestamp}] [${level}] CRITICAL EXCEPTION: ${message}${stack ? '\n' + stack : ''}`;
            }))
        })
    ]
});
exports.default = prodLogger;
//# sourceMappingURL=logger.prod.js.map