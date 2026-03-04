import type { NotificationInstance } from '../models';
export interface NotificationData {
    userId: number;
    type: 'MESSAGE' | 'COLLECTION_REQUEST' | 'INQUIRY' | 'VERIFICATION' | 'MATERIAL_POSTED' | 'WASTE_POST_CREATED';
    title: string;
    message: string;
    relatedId?: number;
}
export declare class NotificationService {
    static createNotification(data: NotificationData): Promise<NotificationInstance>;
    static createBulkNotifications(userIds: number[], data: Omit<NotificationData, 'userId'>): Promise<NotificationInstance[]>;
    static notifyUserVerified(userId: number): Promise<NotificationInstance>;
    static notifyUserUnverified(userId: number): Promise<NotificationInstance>;
    static notifyMaterialPosted(businessUserId: number, materialId: number, materialType: string): Promise<NotificationInstance>;
    static notifyRecyclersNewMaterial(recyclerIds: number[], materialType: string): Promise<NotificationInstance[]>;
    static notifyCollectionRequest(targetUserId: number, requesterName: string, collectionId: number): Promise<NotificationInstance>;
    static notifyNewMessage(recipientId: number, senderName: string, messageId: number): Promise<NotificationInstance>;
    static getUserNotifications(userId: number, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        notifications: NotificationInstance[];
        total: number;
    }>;
    static getUnreadCount(userId: number): Promise<number>;
}
export default NotificationService;
//# sourceMappingURL=notificationService.d.ts.map