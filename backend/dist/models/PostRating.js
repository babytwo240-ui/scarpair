"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const PostRating = sequelize.define('PostRating', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        postId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'waste_posts',
                key: 'id'
            },
            comment: 'Waste post being rated'
        },
        averageRating: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 5.0,
            comment: 'Average rating of this post (starts at 5.0, decreases with valid reports)'
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
        tableName: 'post_ratings',
        timestamps: true,
        indexes: [
            { fields: ['postId'] },
            { fields: ['averageRating'] }
        ]
    });
    PostRating.associate = (models) => {
        PostRating.belongsTo(models.WastePost, { foreignKey: 'postId', as: 'post' });
        models.WastePost.hasOne(PostRating, { foreignKey: 'postId', as: 'postRating' });
    };
    return PostRating;
};
//# sourceMappingURL=PostRating.js.map