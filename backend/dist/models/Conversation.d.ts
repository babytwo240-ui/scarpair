import { Model } from 'sequelize';
interface ConversationAttributes {
    id: number;
    participant1Id: number;
    participant2Id: number;
    wastePostId?: number;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ConversationInstance extends Model<ConversationAttributes>, ConversationAttributes {
}
export {};
//# sourceMappingURL=Conversation.d.ts.map