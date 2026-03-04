"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('MESSAGE', 'COLLECTION_REQUEST', 'INQUIRY', 'VERIFICATION', 'MATERIAL_POSTED', 'WASTE_POST_CREATED'),
            allowNull: false,
            defaultValue: 'MESSAGE'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        relatedId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true
        },
        read: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: true,
        indexes: [
            {
                name: 'idx_notification_user',
                fields: ['userId']
            },
            {
                name: 'idx_notification_read',
                fields: ['read']
            },
            {
                name: 'idx_notification_created',
                fields: ['createdAt']
            }
        ]
    });
    return Notification;
};
//# sourceMappingURL=Notification.js.map