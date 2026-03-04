"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countFailedPasswordAttempts = exports.getRecentPasswordResetAttempts = exports.getPasswordChangeHistory = exports.logPasswordAudit = exports.getUserAgent = exports.getClientIp = void 0;
const models_1 = require("../models");
/**
 * UTILITY FOR PASSWORD AUDIT LOGGING
 * Tracks all password changes for security auditing
 */
const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
};
exports.getClientIp = getClientIp;
const getUserAgent = (req) => {
    return (req.headers['user-agent'] || 'unknown').substring(0, 500); // Limit to 500 chars
};
exports.getUserAgent = getUserAgent;
const logPasswordAudit = async (userId, email, type, changeType, req, status = 'success', reason) => {
    try {
        const ipAddress = (0, exports.getClientIp)(req);
        const userAgent = (0, exports.getUserAgent)(req);
        await models_1.PasswordAudit.create({
            userId,
            email,
            type,
            changeType,
            ipAddress,
            userAgent,
            status,
            reason
        });
        console.log(`✓ Password audit logged for ${email} - ${changeType} (${status})`);
    }
    catch (error) {
        console.error('Error logging password audit:', error);
        // Don't throw error - audit logging shouldn't break the flow
    }
};
exports.logPasswordAudit = logPasswordAudit;
const getPasswordChangeHistory = async (userId, limit = 10) => {
    try {
        const audits = await models_1.PasswordAudit.findAll({
            where: { userId, status: 'success' },
            order: [['createdAt', 'DESC']],
            limit,
            attributes: ['id', 'changeType', 'ipAddress', 'createdAt', 'userAgent']
        });
        return audits;
    }
    catch (error) {
        console.error('Error fetching password change history:', error);
        return [];
    }
};
exports.getPasswordChangeHistory = getPasswordChangeHistory;
const getRecentPasswordResetAttempts = async (email, minutesBack = 60) => {
    try {
        const timeThreshold = new Date(Date.now() - minutesBack * 60 * 1000);
        const attempts = await models_1.PasswordAudit.findAll({
            where: {
                email,
                changeType: 'reset',
                createdAt: {
                    [require('sequelize').Op.gte]: timeThreshold
                }
            },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'ipAddress', 'status', 'createdAt']
        });
        return attempts;
    }
    catch (error) {
        console.error('Error fetching reset attempts:', error);
        return [];
    }
};
exports.getRecentPasswordResetAttempts = getRecentPasswordResetAttempts;
const countFailedPasswordAttempts = async (email, minutesBack = 60) => {
    try {
        const timeThreshold = new Date(Date.now() - minutesBack * 60 * 1000);
        const count = await models_1.PasswordAudit.count({
            where: {
                email,
                changeType: 'reset',
                status: 'failed',
                createdAt: {
                    [require('sequelize').Op.gte]: timeThreshold
                }
            }
        });
        return count;
    }
    catch (error) {
        console.error('Error counting failed attempts:', error);
        return 0;
    }
};
exports.countFailedPasswordAttempts = countFailedPasswordAttempts;
//# sourceMappingURL=passwordAuditUtil.js.map