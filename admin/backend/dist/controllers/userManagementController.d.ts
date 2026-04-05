import { Request, Response } from 'express';
declare const getAllUsers: (req: Request, res: Response) => Promise<any>;
declare const getUserById: (req: Request, res: Response) => Promise<any>;
declare const toggleUserVerification: (req: Request, res: Response) => Promise<any>;
declare const deleteUser: (req: Request, res: Response) => Promise<any>;
export { getAllUsers, getUserById, toggleUserVerification, deleteUser };
//# sourceMappingURL=userManagementController.d.ts.map