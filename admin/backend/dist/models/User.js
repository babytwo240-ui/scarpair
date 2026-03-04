"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('business', 'recycler'),
            allowNull: false,
            comment: 'User type: business owner or recycler'
        },
        email: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false
        },
        businessName: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: true,
            comment: 'For business users'
        },
        companyName: {
            type: sequelize_1.DataTypes.STRING(150),
            allowNull: true,
            comment: 'For recycler users'
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            validate: {
                is: /^[\d\s\-\+\(\)]+$/
            }
        },
        specialization: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: 'For recycler users - what they specialize in (Metals, Plastics, etc.)'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true
        },
        isVerified: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether the user has been verified by admin'
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
        tableName: 'users',
        timestamps: true,
        indexes: [
            {
                fields: ['email']
            },
            {
                fields: ['type']
            }
        ]
    });
    // Hash password before saving
    User.beforeCreate(async (user) => {
        if (user.password) {
            user.password = await bcryptjs_1.default.hash(user.password, 10);
        }
    });
    User.beforeUpdate(async (user) => {
        if (user.changed('password')) {
            user.password = await bcryptjs_1.default.hash(user.password, 10);
        }
    });
    // Method to verify password
    User.prototype.verifyPassword = async function (password) {
        return bcryptjs_1.default.compare(password, this.password);
    };
    // Association with Materials
    User.associate = (models) => {
        User.hasMany(models.Material, {
            foreignKey: 'businessUserId',
            as: 'materials'
        });
    };
    return User;
};
//# sourceMappingURL=User.js.map