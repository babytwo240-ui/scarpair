"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyUserToken = exports.generateRefreshToken = exports.generateUserToken = exports.REFRESH_TOKEN_EXPIRATION = exports.REFRESH_TOKEN_SECRET = exports.JWT_EXPIRATION = exports.JWT_SECRET = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
if (!process.env.JWT_SECRET) {
    throw new Error('❌ CRITICAL: JWT_SECRET environment variable is required!');
}
const JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_SECRET = JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';
exports.JWT_EXPIRATION = JWT_EXPIRATION;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret_change_in_prod';
exports.REFRESH_TOKEN_SECRET = REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '30d';
exports.REFRESH_TOKEN_EXPIRATION = REFRESH_TOKEN_EXPIRATION;
const generateUserToken = (payload) => {
    const options = { expiresIn: JWT_EXPIRATION };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
exports.generateUserToken = generateUserToken;
const generateRefreshToken = (payload) => {
    const options = { expiresIn: REFRESH_TOKEN_EXPIRATION };
    return jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN_SECRET, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyUserToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyUserToken = verifyUserToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=userJwt.js.map