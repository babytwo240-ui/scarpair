"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const Review = sequelize.define('Review', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        businessId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'Business being reviewed'
        },
        reviewerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'User who left the review (recycler)'
        },
        postId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'waste_posts',
                key: 'id'
            },
            comment: 'Associated waste post (optional)'
        },
        rating: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            },
            comment: 'Rating from 1 to 5'
        },
        comment: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Review comment'
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
        tableName: 'reviews',
        timestamps: true
    });
    return Review;
};
//# sourceMappingURL=Review.js.map