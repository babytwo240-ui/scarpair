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
exports.debugCheck = exports.resetPassword = exports.forgotPassword = exports.logout = exports.recyclerLogin = exports.businessLogin = exports.verifyEmail = exports.recyclerSignup = exports.businessSignup = void 0;
const userService = __importStar(require("../services/userService"));
const logger_1 = __importDefault(require("../utils/logger"));
const userJwt_1 = require("../config/userJwt");
const validators_1 = require("../utils/validators");
const passwordUtil_1 = require("../utils/passwordUtil");
const securityUtil_1 = require("../utils/securityUtil");
const emailService = __importStar(require("../services/emailService"));
const passwordResetRateLimitUtil_1 = require("../utils/passwordResetRateLimitUtil");
const passwordAuditUtil_1 = require("../utils/passwordAuditUtil");
const tokenBlacklistService_1 = require("../services/tokenBlacklistService");
const businessSignup = async (req, res) => {
    try {
        const { businessName, email, password, phone } = req.body;
        const validation = (0, validators_1.validateRequiredFields)({ businessName, email, password, phone }, ['businessName', 'email', 'password', 'phone']);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields: validation.missingFields
            });
        }
        if (!(0, validators_1.isValidEmail)(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (!(0, validators_1.isValidPhone)(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        const passwordCheck = (0, validators_1.isStrongPassword)(password);
        if (!passwordCheck.valid) {
            return res.status(400).json({
                error: 'Password does not meet security requirements',
                requirements: passwordCheck.errors
            });
        }
        if (await userService.businessEmailExists(email)) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const verificationCode = (0, passwordUtil_1.generateVerificationCode)();
        const verificationCodeExpiry = (0, passwordUtil_1.generateExpiry)(900);
        const result = await userService.registerBusiness({
            businessName,
            email,
            password,
            phone,
            verificationCode,
            verificationCodeExpiry
        });
        if ('error' in result) {
            return res.status(400).json({ error: result.error });
        }
        await emailService.sendVerificationEmail(email, verificationCode);
        res.status(201).json({
            message: 'Business registered successfully. Please verify your email.',
            email: result.email,
            requiresVerification: true,
            verificationCodeSent: true
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Signup failed' });
    }
};
exports.businessSignup = businessSignup;
const recyclerSignup = async (req, res) => {
    try {
        const { companyName, email, password, phone, specialization } = req.body;
        const validation = (0, validators_1.validateRequiredFields)({ companyName, email, password, phone }, ['companyName', 'email', 'password', 'phone']);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields: validation.missingFields
            });
        }
        if (!(0, validators_1.isValidEmail)(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (!(0, validators_1.isValidPhone)(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        const passwordCheck = (0, validators_1.isStrongPassword)(password);
        if (!passwordCheck.valid) {
            return res.status(400).json({
                error: 'Password does not meet security requirements',
                requirements: passwordCheck.errors
            });
        }
        if (await userService.recyclerEmailExists(email)) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const verificationCode = (0, passwordUtil_1.generateVerificationCode)();
        const verificationCodeExpiry = (0, passwordUtil_1.generateExpiry)(900);
        const result = await userService.registerRecycler({
            companyName,
            email,
            password,
            phone,
            specialization,
            verificationCode,
            verificationCodeExpiry
        });
        if ('error' in result) {
            return res.status(400).json({ error: result.error });
        }
        await emailService.sendVerificationEmail(email, verificationCode);
        res.status(201).json({
            message: 'Recycler registered successfully. Please verify your email.',
            email: result.email,
            requiresVerification: true,
            verificationCodeSent: true
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Signup failed' });
    }
};
exports.recyclerSignup = recyclerSignup;
const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and verification code are required' });
        }
        let user = await userService.findBusinessByEmail(email);
        let type = 'business';
        if (!user) {
            user = await userService.findRecyclerByEmail(email);
            type = 'recycler';
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.verificationCode !== code) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }
        if (user.verificationCodeExpiry && (0, passwordUtil_1.isExpired)(user.verificationCodeExpiry)) {
            return res.status(400).json({ error: 'Verification code has expired' });
        }
        const updatedUser = await userService.verifyUserEmail(email, type);
        if ('error' in updatedUser) {
            return res.status(400).json({ error: updatedUser.error });
        }
        const tokenData = {
            id: updatedUser.id,
            email: updatedUser.email,
            type: updatedUser.type
        };
        if (type === 'business') {
            tokenData.businessName = updatedUser.businessName;
        }
        else {
            tokenData.companyName = updatedUser.companyName;
        }
        const accessToken = (0, userJwt_1.generateUserToken)(tokenData);
        const refreshToken = (0, userJwt_1.generateRefreshToken)(tokenData);
        res.status(200).json({
            message: 'Email verified successfully',
            accessToken,
            refreshToken,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                type: updatedUser.type,
                name: type === 'business' ? updatedUser.businessName : updatedUser.companyName
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Email verification failed' });
    }
};
exports.verifyEmail = verifyEmail;
const businessLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        logger_1.default.debug(`[AUTH-DEBUG] Business login attempt for: ${normalizedEmail}, password length: ${password?.length || 0}`);
        const business = await userService.findBusinessByEmail(normalizedEmail);
        if (!business) {
            logger_1.default.debug(`[AUTH-DEBUG] Business user not found in DB: ${normalizedEmail}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        logger_1.default.debug(`[AUTH-DEBUG] Business user found: ${normalizedEmail}, isVerified: ${business.isVerified}, isLocked: ${business.isLocked}`);
        if ((0, securityUtil_1.isAccountLocked)(business.isLocked || false, business.lockedUntil || null)) {
            logger_1.default.debug(`[AUTH-DEBUG] Business account locked for: ${normalizedEmail}`);
            return res.status(403).json({
                error: (0, securityUtil_1.getLockedAccountMessage)(business.lockedUntil)
            });
        }
        const isValid = await userService.verifyBusinessCredentials(normalizedEmail, password);
        if (!isValid) {
            logger_1.default.debug(`[AUTH-DEBUG] Password MISMATCH for business: ${normalizedEmail}`);
            const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
            const newAttempts = (business.loginAttempts || 0) + 1;
            if ((0, securityUtil_1.shouldLockAccount)(newAttempts, maxAttempts)) {
                await userService.lockUserAccount(normalizedEmail, 'business');
                return res.status(403).json({
                    error: 'Too many failed attempts. Account locked for 30 minutes.'
                });
            }
            else {
                await userService.incrementLoginAttempts(normalizedEmail, 'business', newAttempts);
                return res.status(401).json({
                    error: 'Invalid email or password',
                    remainingAttempts: maxAttempts - newAttempts
                });
            }
        }
        if (!business.isVerified) {
            logger_1.default.debug(`[AUTH-DEBUG] Business account not verified: ${normalizedEmail}`);
            return res.status(403).json({
                error: 'Please verify your email before logging in'
            });
        }
        logger_1.default.debug(`[AUTH-DEBUG] Login SUCCESS for business: ${normalizedEmail}`);
        await userService.resetLoginAttempts(normalizedEmail, 'business');
        const token = (0, userJwt_1.generateUserToken)({
            id: business.id,
            email: business.email,
            businessName: business.businessName,
            type: 'business'
        });
        const refreshToken = (0, userJwt_1.generateRefreshToken)({
            id: business.id,
            email: business.email,
            businessName: business.businessName,
            type: 'business'
        });
        const userResponse = {};
        if (business.id !== undefined && business.id !== null)
            userResponse.id = business.id;
        if (business.businessName !== undefined && business.businessName !== null)
            userResponse.businessName = business.businessName;
        if (business.email !== undefined && business.email !== null)
            userResponse.email = business.email;
        if (business.type !== undefined && business.type !== null)
            userResponse.type = business.type;
        res.setHeader('Content-Type', 'application/json');
        const responseBody = JSON.stringify({
            message: 'Login successful',
            accessToken: token,
            refreshToken: refreshToken,
            user: userResponse
        });
        res.status(200).send(responseBody);
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.businessLogin = businessLogin;
const recyclerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        logger_1.default.debug(`[AUTH-DEBUG] Recycler login attempt for: ${normalizedEmail}, password length: ${password?.length || 0}`);
        const recycler = await userService.findRecyclerByEmail(normalizedEmail);
        if (!recycler) {
            logger_1.default.debug(`[AUTH-DEBUG] Recycler user not found in DB: ${normalizedEmail}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        logger_1.default.debug(`[AUTH-DEBUG] Recycler user found: ${normalizedEmail}, isVerified: ${recycler.isVerified}, isLocked: ${recycler.isLocked}`);
        if ((0, securityUtil_1.isAccountLocked)(recycler.isLocked || false, recycler.lockedUntil || null)) {
            logger_1.default.debug(`[AUTH-DEBUG] Recycler account locked for: ${normalizedEmail}`);
            return res.status(403).json({
                error: (0, securityUtil_1.getLockedAccountMessage)(recycler.lockedUntil)
            });
        }
        const isValid = await userService.verifyRecyclerCredentials(normalizedEmail, password);
        if (!isValid) {
            logger_1.default.debug(`[AUTH-DEBUG] Password MISMATCH for recycler: ${normalizedEmail}`);
            const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
            const newAttempts = (recycler.loginAttempts || 0) + 1;
            if ((0, securityUtil_1.shouldLockAccount)(newAttempts, maxAttempts)) {
                await userService.lockUserAccount(normalizedEmail, 'recycler');
                return res.status(403).json({
                    error: 'Too many failed attempts. Account locked for 30 minutes.'
                });
            }
            else {
                await userService.incrementLoginAttempts(normalizedEmail, 'recycler', newAttempts);
                return res.status(401).json({
                    error: 'Invalid email or password',
                    remainingAttempts: maxAttempts - newAttempts
                });
            }
        }
        if (!recycler.isVerified) {
            logger_1.default.debug(`[AUTH-DEBUG] Recycler account not verified: ${normalizedEmail}`);
            return res.status(403).json({
                error: 'Please verify your email before logging in'
            });
        }
        logger_1.default.debug(`[AUTH-DEBUG] Login SUCCESS for recycler: ${normalizedEmail}`);
        await userService.resetLoginAttempts(normalizedEmail, 'recycler');
        const token = (0, userJwt_1.generateUserToken)({
            id: recycler.id,
            email: recycler.email,
            companyName: recycler.companyName,
            type: 'recycler'
        });
        const refreshToken = (0, userJwt_1.generateRefreshToken)({
            id: recycler.id,
            email: recycler.email,
            companyName: recycler.companyName,
            type: 'recycler'
        });
        const userResponse = {};
        if (recycler.id !== undefined && recycler.id !== null)
            userResponse.id = recycler.id;
        if (recycler.companyName !== undefined && recycler.companyName !== null)
            userResponse.companyName = recycler.companyName;
        if (recycler.email !== undefined && recycler.email !== null)
            userResponse.email = recycler.email;
        if (recycler.type !== undefined && recycler.type !== null)
            userResponse.type = recycler.type;
        res.setHeader('Content-Type', 'application/json');
        const responseBody = JSON.stringify({
            message: 'Login successful',
            accessToken: token,
            refreshToken: refreshToken,
            user: userResponse
        });
        res.status(200).send(responseBody);
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.recyclerLogin = recyclerLogin;
const logout = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            // âœ… Blacklist the token so it can't be used again
            await (0, tokenBlacklistService_1.blacklistToken)(token);
        }
        return res.status(200).json({
            message: 'Logged out successfully',
            status: 'success'
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Logout failed',
            status: 'error'
        });
    }
};
exports.logout = logout;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const ipAddress = (0, passwordAuditUtil_1.getClientIp)(req);
        // Check rate limiting
        const rateLimitResult = await (0, passwordResetRateLimitUtil_1.checkPasswordResetRateLimit)(email, ipAddress);
        if (!rateLimitResult.allowed) {
            await (0, passwordAuditUtil_1.logPasswordAudit)(0, email, 'business', 'reset', req, 'failed', rateLimitResult.reason);
            return res.status(429).json({
                error: rateLimitResult.reason || 'Too many password reset attempts',
                retryAfter: rateLimitResult.resetTime
            });
        }
        let user = await userService.findBusinessByEmail(email);
        let type = 'business';
        if (!user) {
            user = await userService.findRecyclerByEmail(email);
            type = 'recycler';
        }
        if (!user) {
            // Log the attempt even if user doesn't exist (for security monitoring)
            await (0, passwordAuditUtil_1.logPasswordAudit)(0, email, 'business', 'reset', req, 'failed', 'User not found');
            // Return generic success message (security best practice - don't reveal if email exists)
            return res.status(200).json({
                message: 'If the email exists, a reset code will be sent'
            });
        }
        const resetCode = (0, passwordUtil_1.generateVerificationCode)();
        const resetTokenExpiry = (0, passwordUtil_1.generateExpiry)(3600);
        await userService.setPasswordResetToken(email, type, resetCode, resetTokenExpiry);
        // Log successful password reset initiation
        await (0, passwordAuditUtil_1.logPasswordAudit)(user.id, email, type, 'reset', req, 'success');
        await emailService.sendPasswordResetEmail(email, resetCode);
        res.status(200).json({
            message: 'If the email exists, a reset code will be sent'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Email, code, and new password are required' });
        }
        const passwordCheck = (0, validators_1.isStrongPassword)(newPassword);
        if (!passwordCheck.valid) {
            return res.status(400).json({
                error: 'New password does not meet security requirements',
                requirements: passwordCheck.errors
            });
        }
        let user = await userService.findBusinessByEmail(email);
        let type = 'business';
        if (!user) {
            user = await userService.findRecyclerByEmail(email);
            type = 'recycler';
        }
        if (!user) {
            await (0, passwordAuditUtil_1.logPasswordAudit)(0, email, 'business', 'reset', req, 'failed', 'User not found');
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.verificationCode !== code) {
            await (0, passwordAuditUtil_1.logPasswordAudit)(user.id, email, type, 'reset', req, 'failed', 'Invalid reset code');
            return res.status(400).json({ error: 'Invalid reset code' });
        }
        if (user.resetTokenExpiry && (0, passwordUtil_1.isExpired)(user.resetTokenExpiry)) {
            await (0, passwordAuditUtil_1.logPasswordAudit)(user.id, email, type, 'reset', req, 'failed', 'Reset code expired');
            return res.status(400).json({ error: 'Reset code has expired' });
        }
        // Validate new password against history
        const validation = await userService.validateResetPassword(email, newPassword);
        if (!validation.valid) {
            await (0, passwordAuditUtil_1.logPasswordAudit)(user.id, email, type, 'reset', req, 'failed', validation.error);
            return res.status(400).json({ error: validation.error });
        }
        await userService.updateUserPassword(email, type, newPassword);
        // Log successful password reset
        await (0, passwordAuditUtil_1.logPasswordAudit)(user.id, email, type, 'reset', req, 'success');
        // Clear rate limit on successful reset
        await (0, passwordResetRateLimitUtil_1.clearPasswordResetRateLimit)(email, (0, passwordAuditUtil_1.getClientIp)(req));
        res.status(200).json({
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reset password' });
    }
};
exports.resetPassword = resetPassword;
const debugCheck = async (req, res) => {
    try {
        const count = await userService.countAllUsers();
        const users = await userService.getAllUsersSummary();
        res.status(200).json({
            db_summary: {
                total_users: count,
                users_sample: users
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.debugCheck = debugCheck;
//# sourceMappingURL=userAuthController.js.map