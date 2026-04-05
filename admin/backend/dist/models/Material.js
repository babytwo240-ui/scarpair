"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const Material = sequelize.define('Material', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        businessUserId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'Reference to the business user who posted this material'
        },
        materialType: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: 'Type of material (e.g., Bronze, Copper, Plastic, etc.)'
        },
        quantity: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Quantity of the material'
        },
        unit: {
            type: sequelize_1.DataTypes.STRING(50),
            defaultValue: 'kg',
            comment: 'Unit of measurement (kg, lbs, pieces, etc.)'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Detailed description of the material'
        },
        contactEmail: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('available', 'reserved', 'sold'),
            defaultValue: 'available',
            comment: 'Current status of the material post'
        },
        isRecommendedForArtists: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether this material is recommended for artists'
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
        tableName: 'materials',
        timestamps: true,
        indexes: [
            {
                fields: ['businessUserId']
            },
            {
                fields: ['materialType']
            },
            {
                fields: ['status']
            },
            {
                fields: ['isRecommendedForArtists']
            }
        ]
    });
    Material.associate = (models) => {
        Material.belongsTo(models.User, {
            foreignKey: 'businessUserId',
            as: 'business'
        });
    };
    return Material;
};
//# sourceMappingURL=Material.js.map