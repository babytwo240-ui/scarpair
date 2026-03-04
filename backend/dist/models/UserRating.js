"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const UserRating = sequelize.define('UserRating', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'User being rated'
        },
        averageRating: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 5.0,
            comment: 'Average rating of this user (starts at 5.0, decreases with valid reports)'
        },
        totalRatings: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Total number of ratings received'
        },
        totalFeedback: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Total feedback comments received'
        }
    }, {
        tableName: 'user_ratings',
        timestamps: true,
        indexes: [
            { fields: ['userId'] },
            { fields: ['averageRating'] }
        ]
    });
    UserRating.associate = (models) => {
        UserRating.belongsTo(models.User, { foreignKey: 'userId', as: 'ratedUser' });
        models.User.hasOne(UserRating, { foreignKey: 'userId', as: 'userRating' });
    };
    return UserRating;
};
//# sourceMappingURL=UserRating.js.map