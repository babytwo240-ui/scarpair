import { Request, Response } from 'express';
export declare class MessageController {
    static sendMessage(req: Request, res: Response): Promise<void>;
    static getMessages(req: Request, res: Response): Promise<void>;
    static editMessage(req: Request, res: Response): Promise<void>;
    static deleteMessage(req: Request, res: Response): Promise<void>;
}
export default MessageController;
//# sourceMappingURL=messageController.d.ts.map