import { Request, Response } from 'express';
declare const createMaterial: (req: Request, res: Response) => any;
declare const getAllMaterials: (req: Request, res: Response) => Promise<any>;
declare const getRecommendedMaterials: (req: Request, res: Response) => Promise<any>;
export { createMaterial, getAllMaterials, getRecommendedMaterials };
//# sourceMappingURL=materialController.d.ts.map