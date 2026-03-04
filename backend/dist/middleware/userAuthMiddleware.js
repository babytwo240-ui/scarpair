"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const userJwt_1 = require("../config/userJwt");
const tokenBlacklistService_1 = require("../services/tokenBlacklistService");
const authenticateUser = async (req, res, next) => {
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
        // ✅ Check if token is blacklisted
        const blacklisted = await (0, tokenBlacklistService_1.isTokenBlacklisted)(token);
        if (blacklisted) {
            return res.status(401).json({
                error: 'Token has been invalidated. Please login again.'
            });
        }
        const decoded = (0, userJwt_1.verifyUserToken)(token);
        if (!decoded) {
            return res.status(401).json({
                error: 'Invalid or expired token'
            });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            error: 'Authentication error'
        });
    }
};
exports.authenticateUser = authenticateUser;
//# sourceMappingURL=userAuthMiddleware.js.map