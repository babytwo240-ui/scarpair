"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = exports.verifyCredentials = exports.JWT_EXPIRATION = exports.JWT_SECRET = exports.ADMIN_CREDENTIALS = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../', envFile) });
const NODE_ENV = process.env.NODE_ENV || 'development';
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || ''
};
exports.ADMIN_CREDENTIALS = ADMIN_CREDENTIALS;
// Validate admin credentials are properly configured
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === '') {
    if (NODE_ENV === 'production') {
        throw new Error('❌ CRITICAL: ADMIN_PASSWORD must be set in production environment');
    }
}
// Validate JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV === 'development' ? 'dev_jwt_secret_key_12345678' : '');
exports.JWT_SECRET = JWT_SECRET;
if (!process.env.JWT_SECRET && NODE_ENV === 'production') {
    throw new Error('❌ CRITICAL: JWT_SECRET must be set in production environment');
}
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
exports.JWT_EXPIRATION = JWT_EXPIRATION;
/**
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
const verifyCredentials = (username, password) => {
    return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
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