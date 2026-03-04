"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const Feedback = sequelize.define('Feedback', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        collectionId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'collections',
                key: 'id'
            },
            comment: 'Collection associated with this feedback'
        },
        fromUserId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'User giving the feedback'
        },
        toUserId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'User receiving the feedback'
        },
        rating: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            },
            comment: 'Rating from 1-5 stars'
        },
        comment: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Feedback comment'
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('positive', 'negative', 'neutral'),
            allowNull: true,
            comment: 'Type of feedback'
        }
    }, {
        tableName: 'feedbacks',
        timestamps: true,
        indexes: [
            { fields: ['collectionId'] },
            { fields: ['fromUserId'] },
            { fields: ['toUserId'] },
            { fields: ['createdAt'] }
        ]
    });
    Feedback.associate = (models) => {
        Feedback.belongsTo(models.Collection, { foreignKey: 'collectionId', as: 'collection' });
        Feedback.belongsTo(models.User, { foreignKey: 'fromUserId', as: 'fromUser' });
        Feedback.belongsTo(models.User, { foreignKey: 'toUserId', as: 'toUser' });
    };
    return Feedback;
};
//# sourceMappingURL=Feedback.js.map