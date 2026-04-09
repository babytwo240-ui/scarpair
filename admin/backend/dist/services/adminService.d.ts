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
declare const getAllMaterials: () => AdminMaterial[];
declare const getMaterialById: (id: number) => AdminMaterial | null;
declare const createMaterial: (material: MaterialInput) => AdminMaterial;
declare const updateMaterial: (id: number, updates: MaterialUpdate) => AdminMaterial | null;
declare const deleteMaterial: (id: number) => AdminMaterial | null;
declare const getStatistics: () => Statistics;
export { getAllMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, getStatistics };
export type { AdminMaterial, MaterialInput, MaterialUpdate, Statistics };
//# sourceMappingURL=adminService.d.ts.map