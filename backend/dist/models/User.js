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
            comment: 'User has verified their email'
        },
        verificationCode: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            comment: '6-digit verification code'
        },
        verificationCodeExpiry: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'When verification code expires'
        },
        resetToken: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: 'Hashed password reset token'
        },
        resetTokenExpiry: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'When password reset token expires'
        },
        passwordHistory: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON array of last 5 hashed passwords for reuse prevention'
        },
        lastLoginAttempt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Timestamp of last login attempt'
        },
        loginAttempts: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Number of failed login attempts'
        },
        isLocked: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Account temporarily locked due to failed attempts'
        },
        lockedUntil: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'When account lock expires'
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
            },
            {
                fields: ['isVerified']
            },
            {
                fields: ['isLocked']
            }
        ]
    });
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
    User.prototype.verifyPassword = async function (password) {
        return bcryptjs_1.default.compare(password, this.password);
    };
    User.associate = (models) => {
        User.hasMany(models.Material, {
            foreignKey: 'businessUserId',
            as: 'materials'
        });
        User.hasMany(models.WastePost, {
            foreignKey: 'businessId',
            as: 'wastePostsAsOwner'
        });
        User.hasMany(models.WastePost, {
            foreignKey: 'approvedRecyclerId',
            as: 'wastePostsAsRecycler'
        });
    };
    return User;
};
//# sourceMappingURL=User.js.map