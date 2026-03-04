"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = exports.verifyCredentials = exports.JWT_EXPIRATION = exports.JWT_SECRET = exports.ADMIN_CREDENTIALS = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ADMIN_CREDENTIALS = {
    username: 'admin11',
    password: 'asdqwe123'
};
exports.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
exports.JWT_SECRET = JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
exports.JWT_EXPIRATION = JWT_EXPIRATION;
/**
 * Verify admin credentials
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
const verifyCredentials = (username, password) => {
    return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
};
exports.verifyCredentials = verifyCredentials;
/**
 * Generate JWT token
 * @param {AdminPayload} payload - Token payload
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    const options = { expiresIn: JWT_EXPIRATION };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
exports.generateToken = generateToken;
/**
 * Verify JWT token
 * @param {string} token
 * @returns {AdminPayload | null} Decoded token or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map