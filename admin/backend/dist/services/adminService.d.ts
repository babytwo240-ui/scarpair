interface AdminMaterial {
    id: number;
    businessName?: string;
    materialType: string;
    quantity: string;
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
interface MaterialUpdate {
    [key: string]: any;
}
interface Statistics {
    totalMaterials: number;
    totalBusinesses: number;
    materialTypes: Record<string, number>;
    lastUpdated: string;
}
/**
 * Get all materials
 */
declare const getAllMaterials: () => AdminMaterial[];
/**
 * Get material by ID
 */
declare const getMaterialById: (id: number) => AdminMaterial | null;
/**
 * Create material
 */
declare const createMaterial: (material: MaterialInput) => AdminMaterial;
/**
 * Update material by ID
 */
declare const updateMaterial: (id: number, updates: MaterialUpdate) => AdminMaterial | null;
/**
 * Delete material by ID
 */
declare const deleteMaterial: (id: number) => AdminMaterial | null;
/**
 * Get statistics
 */
declare const getStatistics: () => Statistics;
export { getAllMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, getStatistics };
export type { AdminMaterial, MaterialInput, MaterialUpdate, Statistics };
//# sourceMappingURL=adminService.d.ts.map