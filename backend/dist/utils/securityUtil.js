"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLockedAccountMessage = exports.calculateUnlockTime = exports.getLockDurationMs = exports.isAccountLocked = exports.shouldLockAccount = void 0;
const shouldLockAccount = (loginAttempts, maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')) => {
    return loginAttempts >= maxAttempts;
};
exports.shouldLockAccount = shouldLockAccount;
const isAccountLocked = (isLocked, lockedUntil) => {
    if (!isLocked || !lockedUntil) {
        return false;
    }
    if (new Date() > lockedUntil) {
        return false;
    }
    return true;
};
exports.isAccountLocked = isAccountLocked;
const getLockDurationMs = () => {
    const durationSeconds = parseInt(process.env.ACCOUNT_LOCK_DURATION || '1800');
    return durationSeconds * 1000;
};
exports.getLockDurationMs = getLockDurationMs;
const calculateUnlockTime = () => {
    return new Date(Date.now() + (0, exports.getLockDurationMs)());
};
exports.calculateUnlockTime = calculateUnlockTime;
const getLockedAccountMessage = (lockedUntil) => {
    const minutesRemaining = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
    return `Account is temporarily locked. Try again in ${minutesRemaining} minutes.`;
};
exports.getLockedAccountMessage = getLockedAccountMessage;
//# sourceMappingURL=securityUtil.js.map