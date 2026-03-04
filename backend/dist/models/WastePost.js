"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const WastePost = sequelize.define('WastePost', {
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
            comment: 'Reference to the business user who posted this waste'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'Title of the waste post'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: 'Detailed description of the waste material'
        },
        wasteType: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: 'Type of waste (plastic, metal, paper, glass, electronics, etc.)'
        },
        quantity: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Quantity of waste material'
        },
        unit: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'kg',
            comment: 'Unit of measurement (kg, lbs, tons, pieces, etc.)'
        },
        condition: {
            type: sequelize_1.DataTypes.ENUM('poor', 'fair', 'good', 'excellent'),
            allowNull: false,
            comment: 'Condition of the waste material'
        },
        location: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'Physical location of the waste'
        },
        latitude: {
            type: sequelize_1.DataTypes.DECIMAL(10, 8),
            allowNull: false,
            comment: 'Latitude coordinate for the business location'
        },
        longitude: {
            type: sequelize_1.DataTypes.DECIMAL(11, 8),
            allowNull: false,
            comment: 'Longitude coordinate for the business location'
        },
        city: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: 'City where the waste is located'
        },
        address: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'Full address of the waste location'
        },
        price: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Price of the waste material (optional, if being sold)'
        },
        images: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: 'Array of image URLs'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('draft', 'active', 'in-collection', 'collected'),
            defaultValue: 'active',
            comment: 'Current status of the waste post (draft -> active -> in-collection -> collected)'
        },
        visibility: {
            type: sequelize_1.DataTypes.ENUM('private', 'public'),
            defaultValue: 'public',
            comment: 'Whether the post is visible to public or private'
        },
        availabilityCount: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 1,
            comment: 'Number of items available for collection'
        },
        collectionStatus: {
            type: sequelize_1.DataTypes.ENUM('ACTIVE', 'RESERVED', 'PICKED_UP', 'COMPLETED'),
            defaultValue: 'ACTIVE',
            comment: 'Collection workflow status: ACTIVE -> RESERVED -> PICKED_UP -> COMPLETED'
        },
        approvedRecyclerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'ID of the recycler approved to collect this waste'
        },
        pickupDeadline: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Deadline for recycler to pick up (1 hour after approval)'
        },
        pickedUpAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Timestamp when recycler marked as picked up'
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
        tableName: 'waste_posts',
        timestamps: true,
        indexes: [
            {
                fields: ['businessId']
            },
            {
                fields: ['status']
            },
            {
                fields: ['collectionStatus']
            },
            {
                fields: ['approvedRecyclerId']
            },
            {
                fields: ['pickupDeadline']
            },
            {
                fields: ['wasteType']
            },
            {
                fields: ['latitude', 'longitude']
            },
            {
                fields: ['createdAt']
            },
            {
                fields: ['visibility']
            }
        ]
    });
    WastePost.associate = (models) => {
        WastePost.belongsTo(models.User, {
            foreignKey: 'businessId',
            as: 'business'
        });
        WastePost.belongsTo(models.User, {
            foreignKey: 'approvedRecyclerId',
            as: 'approvedRecycler'
        });
    };
    return WastePost;
};
//# sourceMappingURL=WastePost.js.map