"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = exports.verifyCredentials = exports.JWT_EXPIRATION = exports.JWT_SECRET = exports.getAdminCredentials = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
const fs_1 = __importDefault(require("fs"));
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : (fs_1.default.existsSync(path_1.default.join(__dirname, '../../', '.env.local')) ? '.env.local' : '.env');
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../', envFile) });
const NODE_ENV = process.env.NODE_ENV || 'development';
// Read credentials lazily to ensure dotenv has loaded
const getAdminCredentials = () => ({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || ''
});
exports.getAdminCredentials = getAdminCredentials;
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