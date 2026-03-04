"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminToken = exports.ADMIN_JWT_EXPIRATION = exports.ADMIN_JWT_SECRET = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
exports.ADMIN_JWT_SECRET = ADMIN_JWT_SECRET;
const ADMIN_JWT_EXPIRATION = process.env.ADMIN_JWT_EXPIRATION || '24h';
exports.ADMIN_JWT_EXPIRATION = ADMIN_JWT_EXPIRATION;
const verifyAdminToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, ADMIN_JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyAdminToken = verifyAdminToken;
//# sourceMappingURL=adminJwt.js.map