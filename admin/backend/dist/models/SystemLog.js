"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const SystemLog = sequelize.define('SystemLog', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'User who performed the action'
        },
        action: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: 'Type of action performed'
        },
        target: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: 'Resource type being affected (waste_post, collection, user, etc.)'
        },
        targetId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'ID of the affected resource'
        },
        details: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Additional details in JSON format'
        },
        ipAddress: {
            type: sequelize_1.DataTypes.STRING(45),
            allowNull: true,
            comment: 'IP address of the request'
        },
        userAgent: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'User agent / browser info'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('success', 'failed'),
            allowNull: false,
            defaultValue: 'success',
            comment: 'Status of the action'
        },
        timestamp: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: 'When the action occurred'
        }
    }, {
        tableName: 'system_logs',
        timestamps: true,
        indexes: [
            { fields: ['userId'] },
            { fields: ['action'] },
            { fields: ['target', 'targetId'] },
            { fields: ['timestamp'] },
            { fields: ['createdAt'] }
        ]
    });
    return SystemLog;
};
//# sourceMappingURL=SystemLog.js.map