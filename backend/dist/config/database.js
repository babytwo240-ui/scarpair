"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DATABASE_DIALECT = (process.env.DB_DIALECT || 'postgres');
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
if (process.env.NODE_ENV === 'production') {
    const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
    }
}
const config = {
    development: {
        username: DB_USER || 'postgres',
        password: DB_PASSWORD || 'postgres',
        database: DB_NAME || 'scrapair_dev',
        host: DB_HOST || 'localhost',
        port: parseInt(DB_PORT || '5432'),
        dialect: DATABASE_DIALECT,
        logging: console.log
    },
    production: {
        username: DB_USER || '',
        password: DB_PASSWORD || '',
        database: DB_NAME || '',
        host: DB_HOST || '',
        port: parseInt(DB_PORT || '5432'),
        dialect: DATABASE_DIALECT,
        logging: false
    },
    test: {
        username: DB_USER || 'postgres',
        password: DB_PASSWORD || 'postgres',
        database: 'scrapair_test',
        host: DB_HOST || 'localhost',
        port: parseInt(DB_PORT || '5432'),
        dialect: DATABASE_DIALECT,
        logging: false
    }
};
exports.default = config;
module.exports = config;
//# sourceMappingURL=database.js.map