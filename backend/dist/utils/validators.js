"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = exports.validateRequiredFields = exports.isStrongPassword = exports.isValidPhone = exports.isValidEmail = void 0;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPhone = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
const isStrongPassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*...)');
    }
    return {
        valid: errors.length === 0,
        errors
    };
};
exports.isStrongPassword = isStrongPassword;
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter(field => !data[field]);
    return {
        valid: missingFields.length === 0,
        missingFields
    };
};
exports.validateRequiredFields = validateRequiredFields;
const sanitizeInput = (input) => {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .substring(0, 255);
};
exports.sanitizeInput = sanitizeInput;
//# sourceMappingURL=validators.js.map