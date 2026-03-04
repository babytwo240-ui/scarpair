import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import config from '../config/database';

// Load the correct .env file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv.config({ path: path.join(__dirname, '..', '..', envFile) });

const env = (process.env.NODE_ENV || 'development') as keyof typeof config;
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    },
    // SSL settings for Supabase connection pooler
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// Import models
const User = require('./User')(sequelize);
const Material = require('./Material')(sequelize);
const AdminUser = require('./AdminUser')(sequelize);
const WasteCategory = require('./WasteCategory')(sequelize);
const Report = require('./Report')(sequelize);
const UserRating = require('./UserRating')(sequelize);
const PostRating = require('./PostRating')(sequelize);
const SystemLog = require('./SystemLog')(sequelize);

// Register models on sequelize.models
(sequelize as any).models = {
  User,
  Material,
  AdminUser,
  WasteCategory,
  Report,
  UserRating,
  PostRating,
  SystemLog
};

// Initialize models with sequelize instance
const models: any = {
  User,
  Material,
  AdminUser,
  WasteCategory,
  Report,
  UserRating,
  PostRating,
  SystemLog
};

// Set up associations
Object.keys(models).forEach((key) => {
  if (models[key].associate) {
    models[key].associate(models);
  }
});

// Sync models with database (only in development, and non-blocking)
if (process.env.NODE_ENV === 'development') {
  // Don't sync - table already exists from main backend migrations
  // Just verify connection is working
  console.log('🔍 Testing database connection...');
  sequelize.authenticate()
    .then(() => {
      console.log('✓ Database connection authenticated successfully');
      console.log(`✓ Models registered: ${Object.keys((sequelize as any).models).join(', ')}`);
    })
    .catch((err: any) => {
      console.error('❌ Database authentication failed:', err.message);
      console.error('Details:', err);
    });
} else {
  // In production, skip auto-sync to avoid startup delays
  console.log('✓ Database sync skipped in production mode');
}

export { sequelize, User, Material, AdminUser, WasteCategory, Report, UserRating, PostRating, SystemLog };
export default models;
