"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const NODE_ENV = process.env.NODE_ENV || 'production';
const DATABASE_DIALECT = (process.env.DB_DIALECT || 'postgres');
const config = {
    development: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'scrapair_dev',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: DATABASE_DIALECT,
        logging: NODE_ENV === 'development' ? console.log : false
    },
    production: {
        username: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || '',
        host: process.env.DB_HOST || '',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: DATABASE_DIALECT,
        logging: false
    },
    test: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: 'scrapair_test',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: DATABASE_DIALECT,
        logging: false
    }
};
exports.default = config;
//# sourceMappingURL=database.js.map