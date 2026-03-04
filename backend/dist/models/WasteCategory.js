"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize) => {
    const WasteCategory = sequelize.define('WasteCategory', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: 'Category name (e.g., Plastic, Metal, Electronics)'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Description of this waste category'
        },
        icon: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: 'Icon or emoji representing the category'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether this category is available for use'
        }
    }, {
        tableName: 'waste_categories',
        timestamps: true,
        indexes: [
            { fields: ['name'] },
            { fields: ['isActive'] }
        ]
    });
    return WasteCategory;
};
//# sourceMappingURL=WasteCategory.js.map