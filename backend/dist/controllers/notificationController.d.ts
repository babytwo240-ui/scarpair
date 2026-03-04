import { Request, Response } from 'express';
export declare class NotificationController {
    static createNotificationAdmin(req: Request, res: Response): Promise<void>;
    static getNotifications(req: Request, res: Response): Promise<void>;
    static getUnreadCount(req: Request, res: Response): Promise<void>;
    static markAsRead(req: Request, res: Response): Promise<void>;
    static markAllAsRead(req: Request, res: Response): Promise<void>;
    static deleteNotification(req: Request, res: Response): Promise<void>;
    static deleteAllNotifications(req: Request, res: Response): Promise<void>;
}
export default NotificationController;
//# sourceMappingURL=notificationController.d.ts.map