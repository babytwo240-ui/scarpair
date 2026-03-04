"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAccountDeletedEmail = exports.sendAccountVerifiedEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.clearSentEmails = exports.getEmailsForRecipient = exports.getSentEmails = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sentEmails = [];
let transporter = null;
// Initialize email transporter based on environment
const initializeEmailService = async () => {
    if (process.env.EMAIL_SERVICE === 'ethereal') {
        try {
            // For Ethereal - use credentials from .env
            transporter = nodemailer_1.default.createTransport({
                host: process.env.ETHEREAL_HOST || 'smtp.ethereal.email',
                port: parseInt(process.env.ETHEREAL_PORT || '587'),
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.ETHEREAL_USER,
                    pass: process.env.ETHEREAL_PASSWORD,
                },
            });
            // Test connection
            await transporter.verify();
            console.log('✅ Ethereal email service connected');
        }
        catch (error) {
            console.error('❌ Ethereal email connection failed:', error.message);
            console.log('ℹ️ Falling back to mock email service');
            transporter = null;
        }
    }
    else {
        console.log('📧 Email service set to: MOCK (console logging)');
    }
};
// Initialize on module load
initializeEmailService();
const getSentEmails = () => {
    return sentEmails;
};
exports.getSentEmails = getSentEmails;
const getEmailsForRecipient = (email) => {
    return sentEmails.filter(e => e.to === email);
};
exports.getEmailsForRecipient = getEmailsForRecipient;
const clearSentEmails = () => {
    sentEmails.length = 0;
};
exports.clearSentEmails = clearSentEmails;
const sendVerificationEmail = async (email, code) => {
    try {
        sentEmails.push({
            to: email,
            subject: 'Email Verification - Scrapair',
            code,
            timestamp: new Date(),
            type: 'verification'
        });
        if (transporter) {
            // Send via Ethereal
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
                to: email,
                subject: 'Email Verification - Scrapair',
                html: `
          <h2>Verify Your Email</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #007bff; font-size: 36px; font-weight: bold;">${code}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
            });
            console.log(`\n📧 [ETHEREAL EMAIL] Verification sent to: ${email}`);
            console.log(`   Code: ${code}`);
            console.log(`   Preview: ${nodemailer_1.default.getTestMessageUrl(info)}\n`);
        }
        else {
            // Fall back to mock (console logging)
            console.log(`\n📧 [MOCK EMAIL] Verification email sent to: ${email}`);
            console.log(`   Verification Code: ${code}`);
            console.log(`   (This code will expire in 15 minutes)\n`);
        }
        return { success: true, message: 'Verification email sent' };
    }
    catch (error) {
        console.error('Email service error:', error);
        return { success: false, message: 'Failed to send verification email' };
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, code) => {
    try {
        sentEmails.push({
            to: email,
            subject: 'Password Reset Request - Scrapair',
            code,
            timestamp: new Date(),
            type: 'password-reset'
        });
        // Generate reset link with token
        const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${code}`;
        if (transporter) {
            // Send via Ethereal
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
                to: email,
                subject: 'Password Reset Request - Scrapair',
                html: `
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a></p>
          <p>Or copy this link: <code>${resetLink}</code></p>
          <p style="font-size: 12px; color: #666;">Your reset code is: <strong>${code}</strong></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
            });
            console.log(`\n📧 [ETHEREAL EMAIL] Password reset sent to: ${email}`);
            console.log(`   Code: ${code}`);
            console.log(`   Reset Link: ${resetLink}`);
            console.log(`   Preview: ${nodemailer_1.default.getTestMessageUrl(info)}\n`);
        }
        else {
            // Fall back to mock (console logging)
            console.log(`\n📧 [MOCK EMAIL] Password reset email sent to: ${email}`);
            console.log(`   Reset Link: ${resetLink}`);
            console.log(`   Reset Code: ${code}`);
            console.log(`   (This code will expire in 1 hour)\n`);
        }
        return { success: true, message: 'Password reset email sent' };
    }
    catch (error) {
        console.error('Email service error:', error);
        return { success: false, message: 'Failed to send password reset email' };
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendAccountVerifiedEmail = async (email, userName) => {
    try {
        sentEmails.push({
            to: email,
            subject: 'Account Verified - Scrapair',
            code: 'N/A',
            timestamp: new Date(),
            type: 'verified'
        });
        if (transporter) {
            // Send via Ethereal
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
                to: email,
                subject: 'Account Verified - Scrapair',
                html: `
          <h2>Welcome to Scrapair!</h2>
          <p>Hi ${userName},</p>
          <p>Your account has been verified and is now active.</p>
          <p>You can now log in and start using Scrapair.</p>
        `,
            });
            console.log(`\n📧 [ETHEREAL EMAIL] Account verified notification sent to: ${email}`);
            console.log(`   Preview: ${nodemailer_1.default.getTestMessageUrl(info)}\n`);
        }
        else {
            // Fall back to mock (console logging)
            console.log(`\n📧 [MOCK EMAIL] Account verified notification sent to: ${email}`);
            console.log(`   User: ${userName}\n`);
        }
        return { success: true, message: 'Verification notification sent' };
    }
    catch (error) {
        console.error('Email service error:', error);
        return { success: false, message: 'Failed to send verification notification' };
    }
};
exports.sendAccountVerifiedEmail = sendAccountVerifiedEmail;
const sendAccountDeletedEmail = async (email, userName) => {
    try {
        sentEmails.push({
            to: email,
            subject: 'Account Deleted - Scrapair',
            code: 'N/A',
            timestamp: new Date(),
            type: 'deleted'
        });
        if (transporter) {
            // Send via Ethereal
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
                to: email,
                subject: 'Account Deleted - Scrapair',
                html: `
          <h2>Account Deletion Confirmed</h2>
          <p>Hi ${userName},</p>
          <p>Your account has been successfully deleted.</p>
          <p>All your data has been removed from our systems.</p>
          <p>If you have any questions, please contact us.</p>
        `,
            });
            console.log(`\n📧 [ETHEREAL EMAIL] Account deletion confirmation sent to: ${email}`);
            console.log(`   Preview: ${nodemailer_1.default.getTestMessageUrl(info)}\n`);
        }
        else {
            // Fall back to mock (console logging)
            console.log(`\n📧 [MOCK EMAIL] Account deletion confirmation sent to: ${email}`);
            console.log(`   User: ${userName}\n`);
        }
        return { success: true, message: 'Deletion confirmation sent' };
    }
    catch (error) {
        console.error('Email service error:', error);
        return { success: false, message: 'Failed to send deletion confirmation' };
    }
};
exports.sendAccountDeletedEmail = sendAccountDeletedEmail;
//# sourceMappingURL=emailService.js.map