import { Request, Response } from 'express';
declare const businessSignup: (req: Request, res: Response) => Promise<any>;
declare const recyclerSignup: (req: Request, res: Response) => Promise<any>;
declare const verifyEmail: (req: Request, res: Response) => Promise<any>;
declare const businessLogin: (req: Request, res: Response) => Promise<any>;
declare const recyclerLogin: (req: Request, res: Response) => Promise<any>;
declare const logout: (req: Request, res: Response) => Promise<any>;
declare const forgotPassword: (req: Request, res: Response) => Promise<any>;
declare const resetPassword: (req: Request, res: Response) => Promise<any>;
declare const debugCheck: (req: Request, res: Response) => Promise<any>;
export { businessSignup, recyclerSignup, verifyEmail, businessLogin, recyclerLogin, logout, forgotPassword, resetPassword, debugCheck };
//# sourceMappingURL=userAuthController.d.ts.map