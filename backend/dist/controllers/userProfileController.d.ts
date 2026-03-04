import { Request, Response } from 'express';
declare const getUserProfile: (req: Request, res: Response) => Promise<any>;
declare const updateUserProfile: (req: Request, res: Response) => Promise<any>;
declare const changePassword: (req: Request, res: Response) => Promise<any>;
declare const deleteUserAccount: (req: Request, res: Response) => Promise<any>;
export { getUserProfile, updateUserProfile, changePassword, deleteUserAccount };
//# sourceMappingURL=userProfileController.d.ts.map