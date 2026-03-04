import { Request, Response } from 'express';
declare const submitReport: (req: Request, res: Response) => Promise<any>;
declare const getPendingReports: (req: Request, res: Response) => Promise<any>;
declare const approveReport: (req: Request, res: Response) => Promise<any>;
declare const rejectReport: (req: Request, res: Response) => Promise<any>;
declare const getAllReports: (req: Request, res: Response) => Promise<any>;
declare const getUserReports: (req: Request, res: Response) => Promise<any>;
export { submitReport, getPendingReports, approveReport, rejectReport, getAllReports, getUserReports };
//# sourceMappingURL=reportController.d.ts.map