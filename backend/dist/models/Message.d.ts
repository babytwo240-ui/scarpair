import { Model } from 'sequelize';
interface MessageAttributes {
    id: number;
    conversationId: number;
    senderId: number;
    recipientId: number;
    content: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface MessageInstance extends Model<MessageAttributes>, MessageAttributes {
}
export {};
//# sourceMappingURL=Message.d.ts.map