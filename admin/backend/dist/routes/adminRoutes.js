"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController = __importStar(require("../controllers/adminController"));
const userManagementController = __importStar(require("../controllers/userManagementController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const models_1 = require("../models");
const router = express_1.default.Router();
router.post('/login', adminController.login);
router.get('/debug/db-status', async (req, res) => {
    try {
        const User = models_1.sequelize.models.User;
        if (!User) {
            return res.status(500).json({
                error: 'User model not initialized',
                availableModels: Object.keys(models_1.sequelize.models || {})
            });
        }
        const count = await User.count();
        const sample = await User.findAll({ limit: 3, raw: true });
        res.status(200).json({
            status: 'Database connected',
            userCount: count,
            sampleUsers: sample
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Database error',
            details: error.message,
            stack: error.stack
        });
    }
});
router.get('/materials', authMiddleware_1.authenticate, adminController.getAllMaterials);
router.get('/materials/:id', authMiddleware_1.authenticate, adminController.getMaterialById);
router.post('/materials', authMiddleware_1.authenticate, adminController.createMaterial);
router.put('/materials/:id', authMiddleware_1.authenticate, adminController.updateMaterial);
router.delete('/materials/:id', authMiddleware_1.authenticate, adminController.deleteMaterial);
router.get('/users', authMiddleware_1.authenticate, userManagementController.getAllUsers);
router.get('/users/:id', authMiddleware_1.authenticate, userManagementController.getUserById);
router.put('/users/:id/verify', authMiddleware_1.authenticate, userManagementController.toggleUserVerification);
router.delete('/users/:id', authMiddleware_1.authenticate, userManagementController.deleteUser);
router.get('/categories', authMiddleware_1.authenticate, adminController.getWasteCategories);
router.post('/categories', authMiddleware_1.authenticate, adminController.createWasteCategory);
router.put('/categories/:categoryId', authMiddleware_1.authenticate, adminController.updateWasteCategory);
router.delete('/categories/:categoryId', authMiddleware_1.authenticate, adminController.deleteWasteCategory);
router.get('/ratings/users', authMiddleware_1.authenticate, adminController.getAllUserRatings);
router.get('/ratings/posts', authMiddleware_1.authenticate, adminController.getAllPostRatings);
router.get('/reports', authMiddleware_1.authenticate, adminController.getAllReports);
router.get('/logs', authMiddleware_1.authenticate, adminController.getSystemLogs);
router.get('/statistics', authMiddleware_1.authenticate, adminController.getStatistics);
// Subscription management
router.get('/subscriptions', authMiddleware_1.authenticate, adminController.getAllSubscriptions);
router.get('/subscriptions/pending', authMiddleware_1.authenticate, adminController.getPendingSubscriptions);
router.post('/subscriptions/:id/activate', authMiddleware_1.authenticate, adminController.activateSubscription);
router.post('/subscriptions/:id/reject', authMiddleware_1.authenticate, adminController.rejectSubscription);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map