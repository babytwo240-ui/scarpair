"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logFeedbackSubmitted = exports.logReportRejected = exports.logReportApproved = exports.logReportSubmitted = exports.logWasteCategoryChanged = exports.logAdminReactivateUser = exports.logAdminDeactivateUser = exports.logCollectionRequested = exports.logWastePostUpdated = exports.logWastePostCreated = exports.logUserLogout = exports.logUserLogin = exports.logSystemAction = exports.getUserAgent = exports.getClientIP = void 0;
const models_1 = require("../models");
const getClientIP = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
};
exports.getClientIP = getClientIP;
const getUserAgent = (req) => {
    return req.headers['user-agent'] || 'unknown';
};
exports.getUserAgent = getUserAgent;
const logSystemAction = async (userId, action, target, targetId, status, details, req) => {
    try {
        const SystemLog = models_1.sequelize.models.SystemLog;
        await SystemLog.create({
            userId: userId || null,
            action,
            target,
            targetId,
            status,
            details: details ? JSON.stringify(details) : null,
            ipAddress: req ? (0, exports.getClientIP)(req) : null,
            userAgent: req ? (0, exports.getUserAgent)(req) : null,
            timestamp: new Date()
        });
    }
    catch (error) {
    }
};
exports.logSystemAction = logSystemAction;
const logUserLogin = async (userId, req) => {
    await (0, exports.logSystemAction)(userId, 'USER_LOGIN', 'user', userId, 'success', undefined, req);
};
exports.logUserLogin = logUserLogin;
const logUserLogout = async (userId, req) => {
    await (0, exports.logSystemAction)(userId, 'USER_LOGOUT', 'user', userId, 'success', undefined, req);
};
exports.logUserLogout = logUserLogout;
const logWastePostCreated = async (userId, postId, req) => {
    await (0, exports.logSystemAction)(userId, 'WASTE_POST_CREATED', 'waste_post', postId, 'success', undefined, req);
};
exports.logWastePostCreated = logWastePostCreated;
const logWastePostUpdated = async (userId, postId, req) => {
    await (0, exports.logSystemAction)(userId, 'WASTE_POST_UPDATED', 'waste_post', postId, 'success', undefined, req);
};
exports.logWastePostUpdated = logWastePostUpdated;
const logCollectionRequested = async (userId, collectionId, req) => {
    await (0, exports.logSystemAction)(userId, 'COLLECTION_REQUESTED', 'collection', collectionId, 'success', undefined, req);
};
exports.logCollectionRequested = logCollectionRequested;
const logAdminDeactivateUser = async (adminId, targetUserId, req) => {
    await (0, exports.logSystemAction)(adminId, 'ADMIN_DEACTIVATE_USER', 'user', targetUserId, 'success', undefined, req);
};
exports.logAdminDeactivateUser = logAdminDeactivateUser;
const logAdminReactivateUser = async (adminId, targetUserId, req) => {
    await (0, exports.logSystemAction)(adminId, 'ADMIN_REACTIVATE_USER', 'user', targetUserId, 'success', undefined, req);
};
exports.logAdminReactivateUser = logAdminReactivateUser;
const logWasteCategoryChanged = async (adminId, action, categoryId, req) => {
    await (0, exports.logSystemAction)(adminId, `WASTE_CATEGORY_${action}`, 'waste_category', categoryId, 'success', undefined, req);
};
exports.logWasteCategoryChanged = logWasteCategoryChanged;
const logReportSubmitted = async (userId, reportId, req) => {
    await (0, exports.logSystemAction)(userId, 'REPORT_SUBMITTED', 'report', reportId, 'success', undefined, req);
};
exports.logReportSubmitted = logReportSubmitted;
const logReportApproved = async (adminId, reportId, req) => {
    await (0, exports.logSystemAction)(adminId, 'REPORT_APPROVED', 'report', reportId, 'success', undefined, req);
};
exports.logReportApproved = logReportApproved;
const logReportRejected = async (adminId, reportId, req) => {
    await (0, exports.logSystemAction)(adminId, 'REPORT_REJECTED', 'report', reportId, 'success', undefined, req);
};
exports.logReportRejected = logReportRejected;
const logFeedbackSubmitted = async (userId, feedbackId, req) => {
    await (0, exports.logSystemAction)(userId, 'FEEDBACK_SUBMITTED', 'feedback', feedbackId, 'success', undefined, req);
};
exports.logFeedbackSubmitted = logFeedbackSubmitted;
//# sourceMappingURL=systemLogger.js.map