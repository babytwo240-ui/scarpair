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
const adminAuthMiddleware_1 = require("../middleware/adminAuthMiddleware");
const router = express_1.default.Router();
router.use(adminAuthMiddleware_1.authenticateAdmin);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/verify', adminController.verifyUser);
router.delete('/users/:id/delete', adminController.deleteUserAdmin);
router.put('/users/:userId/deactivate', adminController.deactivateUser);
router.put('/users/:userId/reactivate', adminController.reactivateUser);
router.post('/categories', adminController.createWasteCategory);
router.get('/categories', adminController.getWasteCategories);
router.put('/categories/:categoryId', adminController.updateWasteCategory);
router.delete('/categories/:categoryId', adminController.deleteWasteCategory);
router.get('/logs', adminController.getSystemLogs);
router.get('/logs/:action', adminController.getLogsByAction);
router.get('/ratings/users', adminController.getAllUserRatingsAdmin);
router.get('/ratings/posts', adminController.getAllPostRatingsAdmin);
router.get('/reports', adminController.getAllReportsAdmin);
router.post('/seed-test-data', adminController.seedTestData);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map