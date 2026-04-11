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
const authMiddleware_1 = require("../shared/middleware/authMiddleware");
const users_routes_1 = __importDefault(require("../modules/users/users.routes"));
const materials_routes_1 = __importDefault(require("../modules/materials/materials.routes"));
const categories_routes_1 = __importDefault(require("../modules/categories/categories.routes"));
const router = express_1.default.Router();
router.post('/login', adminController.login);
router.use('/materials', materials_routes_1.default);
router.use('/users', users_routes_1.default);
router.use('/categories', categories_routes_1.default);
router.get('/ratings/users', authMiddleware_1.authenticate, adminController.getAllUserRatings);
router.get('/ratings/posts', authMiddleware_1.authenticate, adminController.getAllPostRatings);
router.get('/reports', authMiddleware_1.authenticate, adminController.getAllReports);
router.get('/logs', authMiddleware_1.authenticate, adminController.getSystemLogs);
router.delete('/logs', authMiddleware_1.authenticate, adminController.clearSystemLogs);
router.get('/statistics', authMiddleware_1.authenticate, adminController.getStatistics);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map