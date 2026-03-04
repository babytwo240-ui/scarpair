"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaterial = exports.getMaterialById = exports.getMaterialsByType = exports.getRecommendedMaterials = exports.getAllMaterials = exports.addMaterial = void 0;
let materialsDatabase = [];
let materialId = 1;
const RECOMMENDED_MATERIALS = ['Bronze', 'Copper'];
/**
 * Add a new material to the database
 * @param {MaterialInput} material - Material object
 * @returns {Material} - Created material with ID and timestamp
 */
const addMaterial = (material) => {
    const newMaterial = {
        id: materialId++,
        ...material,
        createdAt: new Date().toISOString()
    };
    materialsDatabase.push(newMaterial);
    return newMaterial;
};
exports.addMaterial = addMaterial;
/**
 * Get all materials in the database
 * @returns {Material[]} - All materials
 */
const getAllMaterials = () => {
    return materialsDatabase;
};
exports.getAllMaterials = getAllMaterials;
/**
 * Get recommended materials for artists based on specific material types
 * @returns {Material[]} - Materials that match artist-recommended types (Bronze, Copper)
 */
const getRecommendedMaterials = () => {
    return materialsDatabase.filter((material) => RECOMMENDED_MATERIALS.includes(material.materialType));
};
exports.getRecommendedMaterials = getRecommendedMaterials;
/**
 * Get materials by type
 * @param {string} materialType - The type of material to filter by
 * @returns {Material[]} - Materials matching the type
 */
const getMaterialsByType = (materialType) => {
    return materialsDatabase.filter((material) => material.materialType === materialType);
};
exports.getMaterialsByType = getMaterialsByType;
/**
 * Get a single material by ID
 * @param {number} id - Material ID
 * @returns {Material|null} - Material object or null if not found
 */
const getMaterialById = (id) => {
    return materialsDatabase.find((material) => material.id === id) || null;
};
exports.getMaterialById = getMaterialById;
/**
 * Delete a material by ID
 * @param {number} id - Material ID
 * @returns {boolean} - True if deleted, false if not found
 */
const deleteMaterial = (id) => {
    const index = materialsDatabase.findIndex((material) => material.id === id);
    if (index > -1) {
        materialsDatabase.splice(index, 1);
        return true;
    }
    return false;
};
exports.deleteMaterial = deleteMaterial;
//# sourceMappingURL=materialService.js.map