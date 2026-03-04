"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExpired = exports.generateExpiry = exports.verifyToken = exports.hashToken = exports.generateResetToken = exports.generateVerificationCode = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateVerificationCode = generateVerificationCode;
const generateResetToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateResetToken = generateResetToken;
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
const verifyToken = (token, hash) => {
    const tokenHash = (0, exports.hashToken)(token);
    return tokenHash === hash;
};
exports.verifyToken = verifyToken;
const generateExpiry = (durationSeconds) => {
    return new Date(Date.now() + durationSeconds * 1000);
};
exports.generateExpiry = generateExpiry;
const isExpired = (expiryDate) => {
    return new Date() > expiryDate;
};
exports.isExpired = isExpired;
//# sourceMappingURL=passwordUtil.js.map