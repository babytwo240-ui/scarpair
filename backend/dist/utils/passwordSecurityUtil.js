"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearPasswordHistory = exports.getPasswordHistoryInfo = exports.isPasswordInHistory = exports.addPasswordToHistory = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * SECURITY UTILITY FOR PASSWORD HISTORY
 * Prevents users from reusing old passwords
 */
const addPasswordToHistory = (currentPasswordHash, passwordHistory) => {
    try {
        let history = [];
        if (passwordHistory) {
            history = JSON.parse(passwordHistory);
        }
        // Add new password to beginning
        history.unshift(currentPasswordHash);
        // Keep only last 5 passwords
        if (history.length > 5) {
            history = history.slice(0, 5);
        }
        return JSON.stringify(history);
    }
    catch (error) {
        console.error('Error adding to password history:', error);
        return JSON.stringify([currentPasswordHash]);
    }
};
exports.addPasswordToHistory = addPasswordToHistory;
const isPasswordInHistory = async (newPassword, passwordHistory) => {
    try {
        if (!passwordHistory) {
            return false;
        }
        const history = JSON.parse(passwordHistory);
        // Check if new password matches any in history
        for (const oldPasswordHash of history) {
            const matches = await bcryptjs_1.default.compare(newPassword, oldPasswordHash);
            if (matches) {
                return true; // Password reuse detected
            }
        }
        return false;
    }
    catch (error) {
        console.error('Error checking password history:', error);
        return false;
    }
};
exports.isPasswordInHistory = isPasswordInHistory;
const getPasswordHistoryInfo = (passwordHistory) => {
    try {
        if (!passwordHistory) {
            return 0;
        }
        const history = JSON.parse(passwordHistory);
        return history.length;
    }
    catch (error) {
        console.error('Error reading password history:', error);
        return 0;
    }
};
exports.getPasswordHistoryInfo = getPasswordHistoryInfo;
const clearPasswordHistory = () => {
    return JSON.stringify([]);
};
exports.clearPasswordHistory = clearPasswordHistory;
//# sourceMappingURL=passwordSecurityUtil.js.map