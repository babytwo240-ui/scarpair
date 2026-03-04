"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReports = exports.getAllReports = exports.rejectReport = exports.approveReport = exports.getPendingReports = exports.submitReport = void 0;
const models_1 = require("../models");
const reportValidator_1 = require("../utils/reportValidator");
const systemLogger_1 = require("../utils/systemLogger");
const submitReport = async (req, res) => {
    try {
        const { reportedUserId, collectionId, postId, reason, description } = req.body;
        const reporterId = req.user?.id;
        if (!reportedUserId || !reason || !description) {
            return res.status(400).json({ message: 'Missing required fields: reportedUserId, reason, description' });
        }
        if (reporterId === reportedUserId) {
            return res.status(400).json({ message: 'You cannot report yourself' });
        }
        const Report = models_1.sequelize.models.Report;
        const WastePost = models_1.sequelize.models.WastePost;
        const Collection = models_1.sequelize.models.Collection;
        let wasteType;
        if (postId) {
            const post = await WastePost.findByPk(postId, { attributes: ['wasteType'] });
            wasteType = post?.wasteType;
        }
        else if (collectionId) {
            const collection = await Collection.findByPk(collectionId, {
                include: [{ model: WastePost, as: 'post', attributes: ['wasteType'] }]
            });
            wasteType = collection?.post?.wasteType;
        }
        const validation = (0, reportValidator_1.validateReportReason)(reason, description, wasteType);
        const report = await Report.create({
            reporterId,
            reportedUserId,
            collectionId: collectionId || null,
            postId: postId || null,
            reason,
            description,
            validityScore: validation.validityScore,
            pointsDeducted: validation.pointsDeduction,
            status: (0, reportValidator_1.shouldAutoApprove)(reason, validation.validityScore, validation.pointsDeduction) ? 'approved' : 'pending',
            isValid: validation.isValid && validation.validityScore >= 0.4
        });
        if (report.status === 'approved') {
            await processReportApproval(reportedUserId, report.id);
        }
        await (0, systemLogger_1.logReportSubmitted)(reporterId, report.id, req);
        res.status(201).json({
            message: `Report submitted successfully. ${report.status === 'approved' ? 'Auto-approved and processed.' : 'Awaiting admin review.'}`,
            data: {
                report: {
                    id: report.id,
                    status: report.status,
                    validityScore: validation.validityScore,
                    validationReason: validation.reasoning
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error submitting report', error: error.message });
    }
};
exports.submitReport = submitReport;
const processReportApproval = async (reportedUserId, reportId) => {
    try {
        const Report = models_1.sequelize.models.Report;
        const UserRating = models_1.sequelize.models.UserRating;
        const report = await Report.findByPk(reportId);
        if (!report || !report.pointsDeducted)
            return;
        let userRating = await UserRating.findOne({ where: { userId: reportedUserId } });
        if (userRating) {
            userRating.averageRating = Math.max(1.0, userRating.averageRating - report.pointsDeducted);
            await userRating.save();
        }
    }
    catch (error) {
    }
};
const getPendingReports = async (req, res) => {
    try {
        const { page = 1, limit = 20, reason } = req.query;
        const offset = (page - 1) * limit;
        const Report = models_1.sequelize.models.Report;
        const User = models_1.sequelize.models.User;
        const where = { status: 'pending' };
        if (reason)
            where.reason = reason;
        const { count, rows } = await Report.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName']
                },
                {
                    model: User,
                    as: 'reportedUser',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset
        });
        res.status(200).json({
            message: 'Pending reports retrieved successfully',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching pending reports', error: error.message });
    }
};
exports.getPendingReports = getPendingReports;
const approveReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const adminId = req.user?.id;
        const Report = models_1.sequelize.models.Report;
        const UserRating = models_1.sequelize.models.UserRating;
        const report = await Report.findByPk(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        if (report.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending reports can be approved' });
        }
        report.status = 'approved';
        report.isValid = true;
        report.approvedBy = adminId;
        report.approvedAt = new Date();
        await report.save();
        if (report.pointsDeducted > 0) {
            let userRating = await UserRating.findOne({ where: { userId: report.reportedUserId } });
            if (userRating) {
                userRating.averageRating = Math.max(1.0, userRating.averageRating - report.pointsDeducted);
                await userRating.save();
            }
        }
        await (0, systemLogger_1.logReportApproved)(adminId, parseInt(reportId), req);
        res.status(200).json({
            message: 'Report approved and points deducted from user rating',
            data: {
                reportId,
                pointsDeducted: report.pointsDeducted,
                status: 'approved'
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error approving report', error: error.message });
    }
};
exports.approveReport = approveReport;
const rejectReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.user?.id;
        const Report = models_1.sequelize.models.Report;
        const report = await Report.findByPk(reportId);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        if (report.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending reports can be rejected' });
        }
        report.status = 'rejected';
        report.isValid = false;
        report.approvedBy = adminId;
        report.approvedAt = new Date();
        report.rejectionReason = rejectionReason || null;
        report.pointsDeducted = 0;
        await report.save();
        await (0, systemLogger_1.logReportRejected)(adminId, parseInt(reportId), req);
        res.status(200).json({
            message: 'Report rejected',
            data: {
                reportId,
                status: 'rejected',
                reason: rejectionReason || null
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error rejecting report', error: error.message });
    }
};
exports.rejectReport = rejectReport;
const getAllReports = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, reason, reportedUserId } = req.query;
        const offset = (page - 1) * limit;
        const Report = models_1.sequelize.models.Report;
        const User = models_1.sequelize.models.User;
        const where = {};
        if (status)
            where.status = status;
        if (reason)
            where.reason = reason;
        if (reportedUserId)
            where.reportedUserId = reportedUserId;
        const { count, rows } = await Report.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName']
                },
                {
                    model: User,
                    as: 'reportedUser',
                    attributes: ['id', 'email', 'type', 'businessName', 'companyName']
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'email'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset
        });
        res.status(200).json({
            message: 'Reports retrieved successfully',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};
exports.getAllReports = getAllReports;
const getUserReports = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const Report = models_1.sequelize.models.Report;
        const User = models_1.sequelize.models.User;
        const { count, rows } = await Report.findAndCountAll({
            where: {
                reportedUserId: userId,
                status: 'approved'
            },
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'email', 'type'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset
        });
        res.status(200).json({
            message: 'Your reports retrieved successfully',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user reports', error: error.message });
    }
};
exports.getUserReports = getUserReports;
//# sourceMappingURL=reportController.js.map