interface Material {
    id: number;
    businessName?: string;
    materialType: string;
    quantity: number;
    description?: string;
    contactEmail: string;
    createdAt: string;
}
interface MaterialInput {
    businessName: string;
    materialType: string;
    quantity: number;
    description?: string;
    contactEmail: string;
}
/**
 * Add a new material to the database
 * @param {MaterialInput} material - Material object
 * @returns {Material} - Created material with ID and timestamp
 */
declare const addMaterial: (material: MaterialInput) => Material;
/**
 * Get all materials in the database
 * @returns {Material[]} - All materials
 */
declare const getAllMaterials: () => Material[];
/**
 * Get recommended materials for artists based on specific material types
 * @returns {Material[]} - Materials that match artist-recommended types (Bronze, Copper)
 */
declare const getRecommendedMaterials: () => Material[];
/**
 * Get materials by type
 * @param {string} materialType - The type of material to filter by
 * @returns {Material[]} - Materials matching the type
 */
declare const getMaterialsByType: (materialType: string) => Material[];
/**
 * Get a single material by ID
 * @param {number} id - Material ID
 * @returns {Material|null} - Material object or null if not found
 */
declare const getMaterialById: (id: number) => Material | null;
/**
 * Delete a material by ID
 * @param {number} id - Material ID
 * @returns {boolean} - True if deleted, false if not found
 */
declare const deleteMaterial: (id: number) => boolean;
export { addMaterial, getAllMaterials, getRecommendedMaterials, getMaterialsByType, getMaterialById, deleteMaterial };
export type { Material, MaterialInput };
//# sourceMappingURL=materialService.d.ts.map