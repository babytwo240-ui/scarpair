import { Model } from 'sequelize';
interface NotificationAttributes {
    id: number;
    userId: number;
    type: 'MESSAGE' | 'COLLECTION_REQUEST' | 'INQUIRY' | 'VERIFICATION' | 'MATERIAL_POSTED' | 'WASTE_POST_CREATED';
    title: string;
    message: string;
    relatedId?: number;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface NotificationInstance extends Model<NotificationAttributes>, NotificationAttributes {
}
export {};
//# sourceMappingURL=Notification.d.ts.map