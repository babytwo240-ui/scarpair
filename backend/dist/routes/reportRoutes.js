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
const reportController = __importStar(require("../controllers/reportController"));
const userAuthMiddleware_1 = require("../middleware/userAuthMiddleware");
const adminAuthMiddleware_1 = require("../middleware/adminAuthMiddleware");
const router = express_1.default.Router();
router.use(userAuthMiddleware_1.authenticateUser);
router.post('/', reportController.submitReport);
router.get('/my-reports', reportController.getUserReports);
router.get('/admin/pending', adminAuthMiddleware_1.authenticateAdmin, reportController.getPendingReports);
router.get('/admin/all', adminAuthMiddleware_1.authenticateAdmin, reportController.getAllReports);
router.put('/admin/:reportId/approve', adminAuthMiddleware_1.authenticateAdmin, reportController.approveReport);
router.put('/admin/:reportId/reject', adminAuthMiddleware_1.authenticateAdmin, reportController.rejectReport);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map