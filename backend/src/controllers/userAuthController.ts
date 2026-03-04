import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { generateUserToken, generateRefreshToken } from '../config/userJwt';
import { isStrongPassword, isValidEmail, isValidPhone, validateRequiredFields } from '../utils/validators';
import { generateVerificationCode, generateResetToken, hashToken, generateExpiry, isExpired } from '../utils/passwordUtil';
import { shouldLockAccount, isAccountLocked, calculateUnlockTime, getLockedAccountMessage } from '../utils/securityUtil';
import * as emailService from '../services/emailService';
import { checkPasswordResetRateLimit, clearPasswordResetRateLimit } from '../utils/passwordResetRateLimitUtil';
import { logPasswordAudit, getClientIp } from '../utils/passwordAuditUtil';
import { blacklistToken } from '../services/tokenBlacklistService';

const businessSignup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { businessName, email, password, phone } = req.body;

    const validation = validateRequiredFields(
      { businessName, email, password, phone },
      ['businessName', 'email', 'password', 'phone']
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields: validation.missingFields
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        requirements: passwordCheck.errors
      });
    }

    if (await userService.businessEmailExists(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = generateExpiry(900); 

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
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

const recyclerSignup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { companyName, email, password, phone, specialization } = req.body;

    const validation = validateRequiredFields(
      { companyName, email, password, phone },
      ['companyName', 'email', 'password', 'phone']
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields: validation.missingFields
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        requirements: passwordCheck.errors
      });
    }

    if (await userService.recyclerEmailExists(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = generateExpiry(900);

   
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
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    let user: any = await userService.findBusinessByEmail(email);
    let type: 'business' | 'recycler' = 'business';

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

    if (user.verificationCodeExpiry && isExpired(user.verificationCodeExpiry)) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    const updatedUser = await userService.verifyUserEmail(email, type);

    if ('error' in updatedUser) {
      return res.status(400).json({ error: updatedUser.error });
    }

    const tokenData: any = {
      id: updatedUser.id,
      email: updatedUser.email,
      type: updatedUser.type
    };

    if (type === 'business') {
      tokenData.businessName = (updatedUser as any).businessName;
    } else {
      tokenData.companyName = (updatedUser as any).companyName;
    }

    const accessToken = generateUserToken(tokenData);
    const refreshToken = generateRefreshToken(tokenData);

    res.status(200).json({
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        type: updatedUser.type,
        name: type === 'business' ? (updatedUser as any).businessName : (updatedUser as any).companyName
      }
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

const businessLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const business = await userService.findBusinessByEmail(email);

    if (!business) {
      console.log(`Business login attempt - user not found: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`Business login attempt for: ${email}, isVerified: ${business.isVerified}, isLocked: ${business.isLocked}`);

    if (isAccountLocked(business.isLocked || false, business.lockedUntil || null)) {
      console.log(`Account locked for: ${email}`);
      return res.status(403).json({
        error: getLockedAccountMessage(business.lockedUntil!)
      });
    }

    const isValid = await userService.verifyBusinessCredentials(email, password);
    console.log(`Password verification for ${email}: ${isValid}`);

    if (!isValid) {
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const newAttempts = (business.loginAttempts || 0) + 1;

      if (shouldLockAccount(newAttempts, maxAttempts)) {
        await userService.lockUserAccount(email, 'business');
        return res.status(403).json({
          error: 'Too many failed attempts. Account locked for 30 minutes.'
        });
      } else {
        await userService.incrementLoginAttempts(email, 'business', newAttempts);
        return res.status(401).json({
          error: 'Invalid email or password',
          remainingAttempts: maxAttempts - newAttempts
        });
      }
    }

    if (!business.isVerified) {
      console.log(`Email not verified for: ${email}`);
      return res.status(403).json({
        error: 'Please verify your email before logging in'
      });
    }

    await userService.resetLoginAttempts(email, 'business');

    const token = generateUserToken({
      id: business.id,
      email: business.email,
      businessName: business.businessName,
      type: 'business'
    });

    const refreshToken = generateRefreshToken({
      id: business.id,
      email: business.email,
      businessName: business.businessName,
      type: 'business'
    });

    const userResponse: any = {};
    if (business.id !== undefined && business.id !== null) userResponse.id = business.id;
    if (business.businessName !== undefined && business.businessName !== null) userResponse.businessName = business.businessName;
    if (business.email !== undefined && business.email !== null) userResponse.email = business.email;
    if (business.type !== undefined && business.type !== null) userResponse.type = business.type;

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Login successful',
      accessToken: token,
      refreshToken: refreshToken,
      user: userResponse
    });
    console.log('Business login response:', responseBody.substring(0, 100));
    res.status(200).send(responseBody);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const recyclerLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const recycler = await userService.findRecyclerByEmail(email);

    if (!recycler) {
      console.log(`Recycler login attempt - user not found: ${email}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`Recycler login attempt for: ${email}, isVerified: ${recycler.isVerified}, isLocked: ${recycler.isLocked}`);

    if (isAccountLocked(recycler.isLocked || false, recycler.lockedUntil || null)) {
      console.log(`Account locked for: ${email}`);
      return res.status(403).json({
        error: getLockedAccountMessage(recycler.lockedUntil!)
      });
    }

    const isValid = await userService.verifyRecyclerCredentials(email, password);
    console.log(`Password verification for ${email}: ${isValid}`);

    if (!isValid) {
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const newAttempts = (recycler.loginAttempts || 0) + 1;

      if (shouldLockAccount(newAttempts, maxAttempts)) {
        await userService.lockUserAccount(email, 'recycler');
        return res.status(403).json({
          error: 'Too many failed attempts. Account locked for 30 minutes.'
        });
      } else {
        await userService.incrementLoginAttempts(email, 'recycler', newAttempts);
        return res.status(401).json({
          error: 'Invalid email or password',
          remainingAttempts: maxAttempts - newAttempts
        });
      }
    }

    if (!recycler.isVerified) {
      console.log(`Email not verified for: ${email}`);
      return res.status(403).json({
        error: 'Please verify your email before logging in'
      });
    }

    await userService.resetLoginAttempts(email, 'recycler');

    const token = generateUserToken({
      id: recycler.id,
      email: recycler.email,
      companyName: recycler.companyName,
      type: 'recycler'
    });

    const refreshToken = generateRefreshToken({
      id: recycler.id,
      email: recycler.email,
      companyName: recycler.companyName,
      type: 'recycler'
    });

    const userResponse: any = {};
    if (recycler.id !== undefined && recycler.id !== null) userResponse.id = recycler.id;
    if (recycler.companyName !== undefined && recycler.companyName !== null) userResponse.companyName = recycler.companyName;
    if (recycler.email !== undefined && recycler.email !== null) userResponse.email = recycler.email;
    if (recycler.type !== undefined && recycler.type !== null) userResponse.type = recycler.type;

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Login successful',
      accessToken: token,
      refreshToken: refreshToken,
      user: userResponse
    });
    console.log('Recycler login response:', responseBody.substring(0, 100));
    res.status(200).send(responseBody);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token) {
      // ✅ Blacklist the token so it can't be used again
      await blacklistToken(token);
    }

    return res.status(200).json({
      message: 'Logged out successfully',
      status: 'success'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'Logout failed',
      status: 'error'
    });
  }
};

const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const ipAddress = getClientIp(req);

    // Check rate limiting
    const rateLimitResult = await checkPasswordResetRateLimit(email, ipAddress);
    if (!rateLimitResult.allowed) {
      await logPasswordAudit(0, email, 'business', 'reset', req, 'failed', rateLimitResult.reason);
      return res.status(429).json({
        error: rateLimitResult.reason || 'Too many password reset attempts',
        retryAfter: rateLimitResult.resetTime
      });
    }

    let user: any = await userService.findBusinessByEmail(email);
    let type: 'business' | 'recycler' = 'business';

    if (!user) {
      user = await userService.findRecyclerByEmail(email);
      type = 'recycler';
    }

    if (!user) {
      // Log the attempt even if user doesn't exist (for security monitoring)
      await logPasswordAudit(0, email, 'business', 'reset', req, 'failed', 'User not found');
      
      // Return generic success message (security best practice - don't reveal if email exists)
      return res.status(200).json({
        message: 'If the email exists, a reset code will be sent'
      });
    }

    const resetCode = generateVerificationCode();
    const resetTokenExpiry = generateExpiry(3600);

    await userService.setPasswordResetToken(email, type, resetCode, resetTokenExpiry);

    // Log successful password reset initiation
    await logPasswordAudit(user.id, email, type, 'reset', req, 'success');

    await emailService.sendPasswordResetEmail(email, resetCode);

    res.status(200).json({
      message: 'If the email exists, a reset code will be sent'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    const passwordCheck = isStrongPassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        error: 'New password does not meet security requirements',
        requirements: passwordCheck.errors
      });
    }

    let user: any = await userService.findBusinessByEmail(email);
    let type: 'business' | 'recycler' = 'business';

    if (!user) {
      user = await userService.findRecyclerByEmail(email);
      type = 'recycler';
    }

    if (!user) {
      await logPasswordAudit(0, email, 'business', 'reset', req, 'failed', 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verificationCode !== code) {
      await logPasswordAudit(user.id, email, type, 'reset', req, 'failed', 'Invalid reset code');
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    if (user.resetTokenExpiry && isExpired(user.resetTokenExpiry)) {
      await logPasswordAudit(user.id, email, type, 'reset', req, 'failed', 'Reset code expired');
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    // Validate new password against history
    const validation = await userService.validateResetPassword(email, newPassword);
    if (!validation.valid) {
      await logPasswordAudit(user.id, email, type, 'reset', req, 'failed', validation.error);
      return res.status(400).json({ error: validation.error });
    }

    await userService.updateUserPassword(email, type, newPassword);

    // Log successful password reset
    await logPasswordAudit(user.id, email, type, 'reset', req, 'success');

    // Clear rate limit on successful reset
    await clearPasswordResetRateLimit(email, getClientIp(req));

    res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

const getDebugEmails = (req: Request, res: Response): any => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  const emails = emailService.getSentEmails();
  res.status(200).json({
    message: 'Sent emails (mock service)',
    count: emails.length,
    emails
  });
};

export {
  businessSignup,
  recyclerSignup,
  verifyEmail,
  businessLogin,
  recyclerLogin,
  logout,
  forgotPassword,
  resetPassword,
  getDebugEmails
};
