"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../config/jwt");
/**
 * Middleware to authenticate JWT tokens
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                error: 'Authorization header is missing'
            });
        }
        // Extract token from "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: 'Token is missing'
            });
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({
                error: 'Invalid or expired token'
            });
        }
        // Attach decoded token to request
        req.admin = decoded;
        next();
    }
    catch (error) {
        return res.status(500).json({
            error: 'Authentication error'
        });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authMiddleware.js.map