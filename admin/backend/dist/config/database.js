"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env.local or .env.production
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../', envFile) });
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATABASE_DIALECT = (process.env.DB_DIALECT || 'postgres');
// Validate required database variables in production
if (NODE_ENV === 'production') {
    const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        throw new Error(`❌ Missing required environment variables for production: ${missing.join(', ')}`);
    }
}
const config = {
    development: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: DATABASE_DIALECT,
        logging: NODE_ENV === 'development' ? console.log : false,
        pool: {
            min: 2,
            max: 10,
            idle: 10000,
            acquire: 30000
        }
    },
    production: {
        username: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
        host: process.env.DB_HOST || '',
        port: parseInt(process.env.DB_PORT || '6543'),
        dialect: DATABASE_DIALECT,
        logging: false,
        pool: {
            min: 5,
            max: 20,
            idle: 30000,
            acquire: 30000
        }
    },
    test: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: 'scrapair_test',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: DATABASE_DIALECT,
        logging: false,
        pool: {
            min: 1,
            max: 5,
            idle: 10000,
            acquire: 30000
        }
    }
};
exports.default = config;
//# sourceMappingURL=database.js.map