"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const Collection = sequelize.define('Collection', {
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
            comment: 'Reference to the waste post being collected'
        },
        recyclerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'Reference to the recycler user requesting collection'
        },
        businessId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'Reference to the business user posting the waste'
        },
        requestDate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            comment: 'ISO string - Date when recycler requested the collection'
        },
        scheduledDate: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            comment: 'ISO string - Date scheduled for the collection'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'scheduled', 'completed', 'confirmed', 'cancelled', 'expired'),
            allowNull: false,
            defaultValue: 'pending',
            comment: 'Status of the collection request'
        },
        confirmedBy: {
            type: sequelize_1.DataTypes.ENUM('recycler', 'business'),
            allowNull: true,
            comment: 'Who confirmed the completed collection'
        },
        completedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Date when the collection was completed'
        },
        transactionCode: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            unique: true,
            comment: 'Unique transaction code format: COLL-YYYYMMDD-NNN'
        },
        rejectionCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Counter for rejections by business on this recycler for this post'
        },
        cancellationCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Counter for cancellations by recycler on this post (cumulative, never resets)'
        },
        cancellationReason: {
            type: sequelize_1.DataTypes.ENUM('SCHEDULE_TOO_LONG', 'TIME_CONFLICT', 'RECYCLER_UNAVAILABLE', 'OTHER'),
            allowNull: true,
            comment: 'Reason provided by business when cancelling collection'
        },
        previousCollectionId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'collections',
                key: 'id'
            },
            comment: 'Reference to previous collection if this is a retry'
        },
        isRetry: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Flag indicating if this is a retry request after cancellation/rejection'
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
        timestamps: true,
        tableName: 'collections',
        indexes: [
            { fields: ['postId'] },
            { fields: ['recyclerId'] },
            { fields: ['businessId'] },
            { fields: ['status'] },
            { fields: ['requestDate'] },
            { fields: ['scheduledDate'] },
            { fields: ['transactionCode'] }
        ]
    });
    // Associations
    Collection.associate = (models) => {
        Collection.belongsTo(models.WastePost, {
            foreignKey: 'postId',
            as: 'post'
        });
        Collection.belongsTo(models.User, {
            foreignKey: 'recyclerId',
            as: 'recycler'
        });
        Collection.belongsTo(models.User, {
            foreignKey: 'businessId',
            as: 'business'
        });
    };
    return Collection;
};
//# sourceMappingURL=Collection.js.map