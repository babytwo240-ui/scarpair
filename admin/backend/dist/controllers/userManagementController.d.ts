import { Request, Response } from 'express';
/**
 * Get all users from database
 * Admin can filter by type (business/recycler) and verification status
 */
declare const getAllUsers: (req: Request, res: Response) => Promise<any>;
/**
 * Get single user details from database
 */
declare const getUserById: (req: Request, res: Response) => Promise<any>;
/**
 * Toggle user verification status and notify user
 */
declare const toggleUserVerification: (req: Request, res: Response) => Promise<any>;
/**
 * Delete user by admin
 */
declare const deleteUser: (req: Request, res: Response) => Promise<any>;
export { getAllUsers, getUserById, toggleUserVerification, deleteUser };
//# sourceMappingURL=userManagementController.d.ts.map