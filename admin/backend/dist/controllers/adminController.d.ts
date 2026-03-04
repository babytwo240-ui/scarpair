import { Request, Response } from 'express';
/**
 * Admin Login
 */
declare const login: (req: Request, res: Response) => any;
/**
 * Get all materials (Admin view)
 */
declare const getAllMaterials: (req: Request, res: Response) => Promise<any>;
/**
 * Get material by ID
 */
declare const getMaterialById: (req: Request, res: Response) => Promise<any>;
/**
 * Create new material (Admin)
 */
declare const createMaterial: (req: Request, res: Response) => Promise<any>;
/**
 * Update material by ID
 */
declare const updateMaterial: (req: Request, res: Response) => Promise<any>;
/**
 * Delete material by ID
 */
declare const deleteMaterial: (req: Request, res: Response) => Promise<any>;
/**
 * Get statistics
 */
declare const getStatistics: (req: Request, res: Response) => Promise<any>;
declare const getWasteCategories: (req: Request, res: Response) => Promise<any>;
declare const createWasteCategory: (req: Request, res: Response) => Promise<any>;
declare const updateWasteCategory: (req: Request, res: Response) => Promise<any>;
declare const deleteWasteCategory: (req: Request, res: Response) => Promise<any>;
declare const getAllUserRatings: (req: Request, res: Response) => Promise<any>;
declare const getAllPostRatings: (req: Request, res: Response) => Promise<any>;
declare const getAllReports: (req: Request, res: Response) => Promise<any>;
declare const getSystemLogs: (req: Request, res: Response) => Promise<any>;
export { login, getAllMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, getStatistics, getWasteCategories, createWasteCategory, updateWasteCategory, deleteWasteCategory, getAllUserRatings, getAllPostRatings, getAllReports, getSystemLogs };
//# sourceMappingURL=adminController.d.ts.map