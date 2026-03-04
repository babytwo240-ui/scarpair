import { Request, Response } from 'express';
export declare class ConversationController {
    static getConversations(req: Request, res: Response): Promise<void>;
    static startConversation(req: Request, res: Response): Promise<void>;
    static getConversation(req: Request, res: Response): Promise<void>;
    static deleteConversation(req: Request, res: Response): Promise<void>;
}
export default ConversationController;
//# sourceMappingURL=conversationController.d.ts.map