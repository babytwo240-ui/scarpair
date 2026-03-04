import dotenv from 'dotenv';

dotenv.config();

// Ensure NODE_ENV defaults to production if not explicitly set
const NODE_ENV = process.env.NODE_ENV || 'production';

interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: 'postgres' | 'mysql';
  logging: boolean | typeof console.log;
}

interface Config {
  development: DatabaseConfig;
  production: DatabaseConfig;
  test: DatabaseConfig;
}

const DATABASE_DIALECT = (process.env.DB_DIALECT || 'postgres') as 'postgres' | 'mysql';

const config: Config = {
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

export default config;
