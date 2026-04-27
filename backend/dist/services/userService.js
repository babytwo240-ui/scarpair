"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersSummary = exports.countAllUsers = exports.validateResetPassword = exports.validateNewPassword = exports.deleteUserAccount = exports.updateUserProfile = exports.updateUserPassword = exports.setPasswordResetToken = exports.lockUserAccount = exports.resetLoginAttempts = exports.incrementLoginAttempts = exports.verifyUserEmail = exports.recyclerEmailExists = exports.businessEmailExists = exports.verifyRecyclerCredentials = exports.verifyBusinessCredentials = exports.findRecyclerByEmail = exports.findBusinessByEmail = exports.registerRecycler = exports.registerBusiness = void 0;
const securityUtil_1 = require("../utils/securityUtil");
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = __importDefault(require("../utils/logger"));
const passwordSecurityUtil_1 = require("../utils/passwordSecurityUtil");
const redis_1 = require("../config/redis");
const businessEmailExists = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await models_1.User.findOne({ where: { email: normalizedEmail, type: 'business' } });
    return !!user;
};
exports.businessEmailExists = businessEmailExists;
const recyclerEmailExists = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await models_1.User.findOne({ where: { email: normalizedEmail, type: 'recycler' } });
    return !!user;
};
exports.recyclerEmailExists = recyclerEmailExists;
const registerBusiness = async (businessData) => {
    try {
        if (await businessEmailExists(businessData.email)) {
            return { error: 'Email already registered' };
        }
        const newBusiness = await models_1.User.create({
            type: 'business',
            businessName: businessData.businessName,
            email: businessData.email,
            password: businessData.password,
            phone: businessData.phone,
            isVerified: false,
            verificationCode: businessData.verificationCode,
            verificationCodeExpiry: businessData.verificationCodeExpiry,
            loginAttempts: 0,
            isLocked: false
        });
        return {
            id: newBusiness.id,
            type: newBusiness.type,
            email: newBusiness.email,
            businessName: newBusiness.businessName,
            isVerified: newBusiness.isVerified,
            loginAttempts: newBusiness.loginAttempts,
            isLocked: newBusiness.isLocked
        };
    }
    catch (error) {
        return { error: error.message || 'Registration failed' };
    }
};
exports.registerBusiness = registerBusiness;
const registerRecycler = async (recyclerData) => {
    try {
        if (await recyclerEmailExists(recyclerData.email)) {
            return { error: 'Email already registered' };
        }
        const newRecycler = await models_1.User.create({
            type: 'recycler',
            companyName: recyclerData.companyName,
            email: recyclerData.email,
            password: recyclerData.password,
            phone: recyclerData.phone,
            specialization: recyclerData.specialization || '',
            isVerified: false,
            verificationCode: recyclerData.verificationCode,
            verificationCodeExpiry: recyclerData.verificationCodeExpiry,
            loginAttempts: 0,
            isLocked: false
        });
        return {
            id: newRecycler.id,
            type: newRecycler.type,
            email: newRecycler.email,
            companyName: newRecycler.companyName,
            isVerified: newRecycler.isVerified,
            loginAttempts: newRecycler.loginAttempts,
            isLocked: newRecycler.isLocked
        };
    }
    catch (error) {
        return { error: error.message || 'Registration failed' };
    }
};
exports.registerRecycler = registerRecycler;
const findBusinessByEmail = async (email) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await models_1.User.findOne({ where: { email: normalizedEmail, type: 'business' } });
        if (!user)
            return null;
        return {
            id: user.id,
            type: user.type,
            email: user.email,
            businessName: user.businessName,
            password: user.password,
            phone: user.phone,
            isVerified: user.isVerified,
            verificationCode: user.verificationCode,
            verificationCodeExpiry: user.verificationCodeExpiry,
            resetToken: user.resetToken,
            resetTokenExpiry: user.resetTokenExpiry,
            loginAttempts: user.loginAttempts,
            isLocked: user.isLocked,
            lockedUntil: user.lockedUntil
        };
    }
    catch (error) {
        return null;
    }
};
exports.findBusinessByEmail = findBusinessByEmail;
const findRecyclerByEmail = async (email) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await models_1.User.findOne({ where: { email: normalizedEmail, type: 'recycler' } });
        if (!user)
            return null;
        return {
            id: user.id,
            type: user.type,
            email: user.email,
            companyName: user.companyName,
            password: user.password,
            phone: user.phone,
            specialization: user.specialization,
            isVerified: user.isVerified,
            verificationCode: user.verificationCode,
            verificationCodeExpiry: user.verificationCodeExpiry,
            resetToken: user.resetToken,
            resetTokenExpiry: user.resetTokenExpiry,
            loginAttempts: user.loginAttempts,
            isLocked: user.isLocked,
            lockedUntil: user.lockedUntil
        };
    }
    catch (error) {
        return null;
    }
};
exports.findRecyclerByEmail = findRecyclerByEmail;
const verifyBusinessCredentials = async (email, password) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        logger_1.default.debug(`[AUTH-DEBUG] Verifying business credentials for: ${normalizedEmail}`);
        const user = await findBusinessByEmail(normalizedEmail);
        if (!user) {
            logger_1.default.debug(`[AUTH-DEBUG] Business user lookup failed for email: ${normalizedEmail}`);
            return false;
        }
        logger_1.default.debug(`[AUTH-DEBUG] Business user found. ID: ${user.id}, Hash length: ${user.password?.length || 0}`);
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        logger_1.default.debug(`[AUTH-DEBUG] Password comparison result for ${normalizedEmail}: ${isValid}`);
        return isValid;
    }
    catch (error) {
        logger_1.default.error(`[AUTH-DEBUG] Error in verifyBusinessCredentials: ${error.message}`);
        return false;
    }
};
exports.verifyBusinessCredentials = verifyBusinessCredentials;
const verifyRecyclerCredentials = async (email, password) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        logger_1.default.debug(`[AUTH-DEBUG] Verifying recycler credentials for: ${normalizedEmail}`);
        const user = await findRecyclerByEmail(normalizedEmail);
        if (!user) {
            logger_1.default.debug(`[AUTH-DEBUG] Recycler user lookup failed for email: ${normalizedEmail}`);
            return false;
        }
        logger_1.default.debug(`[AUTH-DEBUG] Recycler user found. ID: ${user.id}, Hash length: ${user.password?.length || 0}`);
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        logger_1.default.debug(`[AUTH-DEBUG] Password comparison result for ${normalizedEmail}: ${isValid}`);
        return isValid;
    }
    catch (error) {
        logger_1.default.error(`[AUTH-DEBUG] Error in verifyRecyclerCredentials: ${error.message}`);
        return false;
    }
};
exports.verifyRecyclerCredentials = verifyRecyclerCredentials;
const verifyUserEmail = async (email, type) => {
    try {
        const user = await models_1.User.findOne({ where: { email, type } });
        if (!user)
            return { error: 'User not found' };
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpiry = null;
        await user.save();
        return {
            id: user.id,
            type: user.type,
            email: user.email,
            businessName: user.businessName,
            companyName: user.companyName,
            isVerified: user.isVerified,
            loginAttempts: user.loginAttempts,
            isLocked: user.isLocked
        };
    }
    catch (error) {
        return { error: error.message || 'Verification failed' };
    }
};
exports.verifyUserEmail = verifyUserEmail;
const incrementLoginAttempts = async (email, type, attempts) => {
    try {
        await models_1.User.update({ loginAttempts: attempts, lastLoginAttempt: new Date() }, { where: { email, type } });
    }
    catch (error) {
    }
};
exports.incrementLoginAttempts = incrementLoginAttempts;
const resetLoginAttempts = async (email, type) => {
    try {
        await models_1.User.update({ loginAttempts: 0, isLocked: false, lockedUntil: null }, { where: { email, type } });
    }
    catch (error) {
    }
};
exports.resetLoginAttempts = resetLoginAttempts;
const lockUserAccount = async (email, type) => {
    try {
        await models_1.User.update({ isLocked: true, lockedUntil: (0, securityUtil_1.calculateUnlockTime)() }, { where: { email, type } });
    }
    catch (error) {
    }
};
exports.lockUserAccount = lockUserAccount;
const setPasswordResetToken = async (email, type, resetCode, resetTokenExpiry) => {
    try {
        await models_1.User.update({ verificationCode: resetCode, resetTokenExpiry }, { where: { email, type } });
    }
    catch (error) {
    }
};
exports.setPasswordResetToken = setPasswordResetToken;
const updateUserPassword = async (email, type, newPassword) => {
    try {
        // Get current user to access password history
        const user = await models_1.User.findOne({ where: { email, type } });
        if (!user) {
            throw new Error('User not found');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Add current password hash to history before updating
        const newPasswordHistory = (0, passwordSecurityUtil_1.addPasswordToHistory)(user.password, user.passwordHistory);
        await models_1.User.update({
            password: hashedPassword,
            verificationCode: null,
            resetTokenExpiry: null,
            passwordHistory: newPasswordHistory
        }, { where: { email, type } });
        // Clear password reset token from Redis cache if it exists
        try {
            await redis_1.redisClient.del(`pwd_reset:${email}`);
        }
        catch (error) {
        }
    }
    catch (error) {
    }
};
exports.updateUserPassword = updateUserPassword;
const updateUserProfile = async (email, type, updates) => {
    try {
        const updateData = {};
        if (updates.phone)
            updateData.phone = updates.phone;
        if (updates.businessName && type === 'business')
            updateData.businessName = updates.businessName;
        if (updates.companyName && type === 'recycler')
            updateData.companyName = updates.companyName;
        if (updates.specialization && type === 'recycler')
            updateData.specialization = updates.specialization;
        const user = await models_1.User.findOne({ where: { email, type } });
        if (!user)
            return { error: 'User not found' };
        await user.update(updateData);
        return {
            id: user.id,
            type: user.type,
            email: user.email,
            phone: user.phone,
            businessName: user.businessName,
            companyName: user.companyName,
            isVerified: user.isVerified,
            loginAttempts: user.loginAttempts,
            isLocked: user.isLocked
        };
    }
    catch (error) {
        return { error: error.message || 'Profile update failed' };
    }
};
exports.updateUserProfile = updateUserProfile;
const deleteUserAccount = async (email, type) => {
    try {
        const user = await models_1.User.findOne({ where: { email, type } });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        const { deleteUserWithCascade } = require('./userDeletionService');
        try {
            const result = await deleteUserWithCascade(user.id, type, models_1.sequelize);
            if (result.success) {
                return { success: true };
            }
            else {
                return { success: false, error: result.message || 'Failed to delete account' };
            }
        }
        catch (cascadeError) {
            const errorMessage = cascadeError?.message || cascadeError?.error?.message || JSON.stringify(cascadeError);
            console.error('Cascade delete error:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }
    catch (error) {
        console.error('Delete account error:', error.message);
        return { success: false, error: error.message };
    }
};
exports.deleteUserAccount = deleteUserAccount;
const validateNewPassword = async (email, type, currentPassword, newPassword) => {
    try {
        const user = await models_1.User.findOne({ where: { email, type } });
        if (!user) {
            return { valid: false, error: 'User not found' };
        }
        // Verify current password
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return { valid: false, error: 'Current password is incorrect' };
        }
        // Check if new password is same as current
        const isSameAsCurrentPassword = await bcryptjs_1.default.compare(newPassword, user.password);
        if (isSameAsCurrentPassword) {
            return { valid: false, error: 'New password cannot be the same as current password' };
        }
        // Check password history
        const isReused = await (0, passwordSecurityUtil_1.isPasswordInHistory)(newPassword, user.passwordHistory);
        if (isReused) {
            return { valid: false, error: 'You cannot reuse one of your last 5 passwords' };
        }
        return { valid: true };
    }
    catch (error) {
        return { valid: false, error: 'Password validation failed' };
    }
};
exports.validateNewPassword = validateNewPassword;
const validateResetPassword = async (email, newPassword) => {
    try {
        let user = await models_1.User.findOne({ where: { email, type: 'business' } });
        if (!user) {
            user = await models_1.User.findOne({ where: { email, type: 'recycler' } });
        }
        if (!user) {
            return { valid: false, error: 'User not found' };
        }
        // Check if new password is same as current
        const isSameAsCurrentPassword = await bcryptjs_1.default.compare(newPassword, user.password);
        if (isSameAsCurrentPassword) {
            return { valid: false, error: 'New password cannot be the same as current password' };
        }
        // Check password history
        const isReused = await (0, passwordSecurityUtil_1.isPasswordInHistory)(newPassword, user.passwordHistory);
        if (isReused) {
            return { valid: false, error: 'You cannot reuse one of your last 5 passwords' };
        }
        return { valid: true };
    }
    catch (error) {
        return { valid: false, error: 'Password validation failed' };
    }
};
exports.validateResetPassword = validateResetPassword;
const countAllUsers = async () => {
    return await models_1.User.count();
};
exports.countAllUsers = countAllUsers;
const getAllUsersSummary = async () => {
    return await models_1.User.findAll({
        attributes: ['id', 'email', 'type', 'isVerified', 'isLocked'],
        limit: 200,
        order: [['id', 'DESC']]
    });
};
exports.getAllUsersSummary = getAllUsersSummary;
//# sourceMappingURL=userService.js.map