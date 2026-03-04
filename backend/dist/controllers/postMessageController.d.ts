import { Request, Response } from 'express';
export declare const PostMessageController: {
    sendMessage: (req: Request, res: Response) => Promise<any>;
    getPostMessages: (req: Request, res: Response) => Promise<any>;
    getInbox: (req: Request, res: Response) => Promise<any>;
    markAsRead: (req: Request, res: Response) => Promise<any>;
    deleteMessage: (req: Request, res: Response) => Promise<any>;
};
//# sourceMappingURL=postMessageController.d.ts.map