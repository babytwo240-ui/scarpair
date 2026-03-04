"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const PostMessage = sequelize.define('PostMessage', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        postId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'waste_posts',
                key: 'id'
            },
            comment: 'Waste post being inquired about'
        },
        senderId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'User sending the inquiry (recycler)'
        },
        recipientId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'Business owner receiving the inquiry'
        },
        subject: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'Message subject'
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: 'Message content'
        },
        isRead: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether recipient has read the message'
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
        tableName: 'post_messages',
        timestamps: true,
        indexes: [
            { fields: ['postId'] },
            { fields: ['senderId'] },
            { fields: ['recipientId'] },
            { fields: ['isRead'] }
        ]
    });
    return PostMessage;
};
//# sourceMappingURL=PostMessage.js.map