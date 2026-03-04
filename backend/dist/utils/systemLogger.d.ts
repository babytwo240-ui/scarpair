import { Request } from 'express';
export declare const getClientIP: (req: Request) => string;
export declare const getUserAgent: (req: Request) => string;
export declare const logSystemAction: (userId: number | undefined, action: string, target: string | undefined, targetId: number | undefined, status: "success" | "failed", details?: any, req?: Request) => Promise<void>;
export declare const logUserLogin: (userId: number, req?: Request) => Promise<void>;
export declare const logUserLogout: (userId: number, req?: Request) => Promise<void>;
export declare const logWastePostCreated: (userId: number, postId: number, req?: Request) => Promise<void>;
export declare const logWastePostUpdated: (userId: number, postId: number, req?: Request) => Promise<void>;
export declare const logCollectionRequested: (userId: number, collectionId: number, req?: Request) => Promise<void>;
export declare const logAdminDeactivateUser: (adminId: number, targetUserId: number, req?: Request) => Promise<void>;
export declare const logAdminReactivateUser: (adminId: number, targetUserId: number, req?: Request) => Promise<void>;
export declare const logWasteCategoryChanged: (adminId: number, action: string, categoryId: number, req?: Request) => Promise<void>;
export declare const logReportSubmitted: (userId: number, reportId: number, req?: Request) => Promise<void>;
export declare const logReportApproved: (adminId: number, reportId: number, req?: Request) => Promise<void>;
export declare const logReportRejected: (adminId: number, reportId: number, req?: Request) => Promise<void>;
export declare const logFeedbackSubmitted: (userId: number, feedbackId: number, req?: Request) => Promise<void>;
//# sourceMappingURL=systemLogger.d.ts.map