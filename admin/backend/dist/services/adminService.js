"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatistics = exports.deleteMaterial = exports.updateMaterial = exports.createMaterial = exports.getMaterialById = exports.getAllMaterials = void 0;
let materialsDatabase = [];
let materialId = 1;
/**
 * Initialize database with sample data
 */
const initializeDatabase = () => {
    materialsDatabase = [
        {
            id: materialId++,
            businessName: 'ABC Metals Inc',
            materialType: 'Metals',
            quantity: '500 kg',
            description: 'Scrap metal from industrial manufacturing',
            contactEmail: 'contact@abcmetals.com',
            createdAt: new Date().toISOString()
        },
        {
            id: materialId++,
            businessName: 'Bronze Works Ltd',
            materialType: 'Bronze',
            quantity: '100 kg',
            description: 'Recycled bronze sheets',
            contactEmail: 'info@bronzeworks.com',
            createdAt: new Date().toISOString()
        }
    ];
};
// Initialize on load
initializeDatabase();
/**
 * Get all materials
 */
const getAllMaterials = () => {
    return materialsDatabase;
};
exports.getAllMaterials = getAllMaterials;
/**
 * Get material by ID
 */
const getMaterialById = (id) => {
    return materialsDatabase.find((m) => m.id === id) || null;
};
exports.getMaterialById = getMaterialById;
/**
 * Create material
 */
const createMaterial = (material) => {
    const newMaterial = {
        id: materialId++,
        ...material,
        quantity: material.quantity.toString(),
        createdAt: new Date().toISOString()
    };
    materialsDatabase.push(newMaterial);
    return newMaterial;
};
exports.createMaterial = createMaterial;
/**
 * Update material by ID
 */
const updateMaterial = (id, updates) => {
    const index = materialsDatabase.findIndex((m) => m.id === id);
    if (index > -1) {
        materialsDatabase[index] = { ...materialsDatabase[index], ...updates };
        return materialsDatabase[index];
    }
    return null;
};
exports.updateMaterial = updateMaterial;
/**
 * Delete material by ID
 */
const deleteMaterial = (id) => {
    const index = materialsDatabase.findIndex((m) => m.id === id);
    if (index > -1) {
        const deleted = materialsDatabase.splice(index, 1);
        return deleted[0];
    }
    return null;
};
exports.deleteMaterial = deleteMaterial;
/**
 * Get statistics
 */
const getStatistics = () => {
    const materialTypes = {};
    materialsDatabase.forEach((m) => {
        materialTypes[m.materialType] = (materialTypes[m.materialType] || 0) + 1;
    });
    return {
        totalMaterials: materialsDatabase.length,
        totalBusinesses: new Set(materialsDatabase.map((m) => m.businessName)).size,
        materialTypes: materialTypes,
        lastUpdated: new Date().toISOString()
    };
};
exports.getStatistics = getStatistics;
//# sourceMappingURL=adminService.js.map