"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.Subscription = exports.SystemLog = exports.PostRating = exports.UserRating = exports.Report = exports.WasteCategory = exports.AdminUser = exports.Material = exports.User = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database"));
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
dotenv_1.default.config({ path: path_1.default.join(__dirname, '..', '..', envFile) });
const env = (process.env.NODE_ENV || 'development');
const dbConfig = database_1.default[env];
console.log('🔧 DEBUG: Database Config');
console.log('envFile:', envFile);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('env:', env);
console.log('DB_HOST env var:', process.env.DB_HOST);
console.log('dbConfig:', { host: dbConfig.host, port: dbConfig.port, database: dbConfig.database, username: dbConfig.username });
const sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: 'UTC',
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
    ...(dbConfig.host && dbConfig.host.includes('supabase') && {
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    })
});
exports.sequelize = sequelize;
const User = require('./User')(sequelize);
exports.User = User;
const Material = require('./Material')(sequelize);
exports.Material = Material;
const AdminUser = require('./AdminUser')(sequelize);
exports.AdminUser = AdminUser;
const WasteCategory = require('./WasteCategory')(sequelize);
exports.WasteCategory = WasteCategory;
const Report = require('./Report')(sequelize);
exports.Report = Report;
const UserRating = require('./UserRating')(sequelize);
exports.UserRating = UserRating;
const PostRating = require('./PostRating')(sequelize);
exports.PostRating = PostRating;
const SystemLog = require('./SystemLog')(sequelize);
exports.SystemLog = SystemLog;
const Subscription = require('./Subscription')(sequelize);
exports.Subscription = Subscription;
const Notification = require('./Notification')(sequelize);
exports.Notification = Notification;
sequelize.models = {
    User,
    Material,
    AdminUser,
    WasteCategory,
    Report,
    UserRating,
    PostRating,
    SystemLog,
    Subscription,
    Notification
};
const models = {
    User,
    Material,
    AdminUser,
    WasteCategory,
    Report,
    UserRating,
    PostRating,
    SystemLog,
    Subscription,
    Notification
};
Object.keys(models).forEach((key) => {
    if (models[key].associate) {
        models[key].associate(models);
    }
});
if (process.env.NODE_ENV === 'development') {
    sequelize.authenticate()
        .then(() => {
    })
        .catch((err) => {
    });
}
else {
}
exports.default = models;
//# sourceMappingURL=index.js.map