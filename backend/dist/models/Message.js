"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const Message = sequelize.define('Message', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conversationId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'conversations',
                key: 'id'
            }
        },
        senderId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        recipientId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: [1, 5000]
            }
        },
        imageUrl: {
            type: sequelize_1.DataTypes.STRING(500),
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
        modelName: 'Message',
        tableName: 'messages',
        timestamps: true,
        indexes: [
            {
                name: 'idx_message_conversation',
                fields: ['conversationId']
            },
            {
                name: 'idx_message_sender',
                fields: ['senderId']
            },
            {
                name: 'idx_message_created',
                fields: ['createdAt']
            }
        ]
    });
    return Message;
};
//# sourceMappingURL=Message.js.map