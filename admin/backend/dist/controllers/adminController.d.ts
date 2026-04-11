import { Request, Response } from 'express';
declare const login: (req: Request, res: Response) => Promise<any>;
declare const getStatistics: (req: Request, res: Response) => Promise<any>;
declare const getAllReports: (req: Request, res: Response) => Promise<any>;
declare const getSystemLogs: (req: Request, res: Response) => Promise<any>;
declare const clearSystemLogs: (req: Request, res: Response) => Promise<any>;
export { login, getStatistics, getAllReports, getSystemLogs, clearSystemLogs };
//# sourceMappingURL=adminController.d.ts.map