"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const adminJwt_1 = require("../config/adminJwt");
const authenticateAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                error: 'Authorization header is missing'
            });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: 'Token is missing'
            });
        }
        const decoded = (0, adminJwt_1.verifyAdminToken)(token);
        if (!decoded) {
            return res.status(401).json({
                error: 'Invalid or expired admin token'
            });
        }
        req.admin = decoded;
        next();
    }
    catch (error) {
        return res.status(500).json({
            error: 'Authentication error'
        });
    }
};
exports.authenticateAdmin = authenticateAdmin;
//# sourceMappingURL=adminAuthMiddleware.js.map