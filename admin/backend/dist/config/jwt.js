"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = exports.verifyCredentials = exports.JWT_EXPIRATION = exports.JWT_SECRET = exports.getAdminCredentials = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Read credentials lazily to ensure dotenv has loaded
const getAdminCredentials = () => ({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || ''
});
exports.getAdminCredentials = getAdminCredentials;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
exports.JWT_SECRET = JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
exports.JWT_EXPIRATION = JWT_EXPIRATION;
/**
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
const verifyCredentials = (username, password) => {
    const creds = getAdminCredentials();
    if (!creds.password) {
        console.warn('⚠️  WARNING: ADMIN_PASSWORD is not set in environment variables!');
    }
    return username === creds.username && password === creds.password;
};
exports.verifyCredentials = verifyCredentials;
/**
 * @param {AdminPayload} payload
 * @returns {string}
 */
const generateToken = (payload) => {
    const options = { expiresIn: JWT_EXPIRATION };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
};
exports.generateToken = generateToken;
/**
 * @param {string} token
 * @returns {AdminPayload | null}
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