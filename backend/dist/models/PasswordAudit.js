"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const PasswordAudit = sequelize.define('PasswordAudit', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to user'
        },
        email: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: 'Email of user for easier lookup'
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('business', 'recycler'),
            allowNull: false,
            comment: 'User type'
        },
        changeType: {
            type: sequelize_1.DataTypes.ENUM('reset', 'change'),
            allowNull: false,
            comment: 'reset = forgot password flow, change = edit profile flow'
        },
        ipAddress: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: 'IP address from which password was changed'
        },
        userAgent: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Browser/device info'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('success', 'failed'),
            allowNull: false,
            defaultValue: 'success',
            comment: 'Whether password change succeeded'
        },
        reason: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: 'Reason for failure if applicable'
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
        tableName: 'password_audits',
        timestamps: true,
        indexes: [
            { fields: ['userId'] },
            { fields: ['email'] },
            { fields: ['createdAt'] },
            { fields: ['ipAddress'] },
            { fields: ['changeType'] }
        ]
    });
    return PasswordAudit;
};
//# sourceMappingURL=PasswordAudit.js.map