"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
module.exports = (sequelize) => {
    const AdminUser = sequelize.define('AdminUser', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        password: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false
        },
        email: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        role: {
            type: sequelize_1.DataTypes.ENUM('super_admin', 'admin'),
            defaultValue: 'admin',
            comment: 'Admin role level'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true
        },
        lastLogin: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        tableName: 'admin_users',
        timestamps: true,
        indexes: [
            {
                fields: ['username']
            },
            {
                fields: ['email']
            }
        ]
    });
    // Hash password before saving
    AdminUser.beforeCreate(async (user) => {
        if (user.password) {
            user.password = await bcryptjs_1.default.hash(user.password, 10);
        }
    });
    AdminUser.beforeUpdate(async (user) => {
        if (user.changed('password')) {
            user.password = await bcryptjs_1.default.hash(user.password, 10);
        }
    });
    // Method to verify password
    AdminUser.prototype.verifyPassword = async function (password) {
        return bcryptjs_1.default.compare(password, this.password);
    };
    return AdminUser;
};
//# sourceMappingURL=AdminUser.js.map