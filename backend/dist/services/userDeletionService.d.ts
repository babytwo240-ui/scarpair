import { Sequelize } from 'sequelize';
export interface DeleteResult {
    success: boolean;
    deletedUserId: number;
    deletedCount: {
        user: number;
        wastePosts: number;
        collections: number;
        messages: number;
        conversations: number;
        notifications: number;
        reviews: number;
        ratings: number;
        feedback: number;
        postMessages: number;
        reports: number;
        systemLogs: number;
    };
    message: string;
}
export declare const deleteUserWithCascade: (userId: number, userType: "business" | "recycler", sequelizeInstance: Sequelize) => Promise<DeleteResult>;
//# sourceMappingURL=userDeletionService.d.ts.map