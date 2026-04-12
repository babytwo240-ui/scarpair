// Auth Module - Exports re-exported from original controller
// Façade pattern: allows modules to work while we migrate business logic

import { Request, Response } from 'express';
import * as userService from '../../services/userService';
import { generateUserToken, generateRefreshToken } from '../../config/userJwt';
import { isStrongPassword, isValidEmail, isValidPhone, validateRequiredFields } from '../../utils/validators';
import { generateVerificationCode, generateExpiry, isExpired } from '../../utils/passwordUtil';
import { shouldLockAccount, isAccountLocked, calculateUnlockTime, getLockedAccountMessage } from '../../utils/securityUtil';
import * as emailService from '../../services/emailService';
import { blacklistToken } from '../../services/tokenBlacklistService';

// Business Signup
export const businessSignup = async (req: Request, res: Response): Promise<any> => {
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
    res.status(500).json({ 
      error: 'Signup failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Recycler Signup
export const recyclerSignup = async (req: Request, res: Response): Promise<any> => {
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
    res.status(500).json({ 
      error: 'Signup failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
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
      return res.status(400).json({ error: (updatedUser as any).error });
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
    res.status(500).json({ error: 'Email verification failed' });
  }
};

// Business Login
export const businessLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const business = await userService.findBusinessByEmail(email);

    if (!business) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (isAccountLocked(business.isLocked || false, business.lockedUntil || null)) {
      return res.status(403).json({
        error: getLockedAccountMessage(business.lockedUntil!)
      });
    }

    const isValid = await userService.verifyBusinessCredentials(email, password);
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

    res.status(200).json({
      message: 'Login successful',
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        id: business.id,
        email: business.email,
        type: business.type
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Recycler Login
export const recyclerLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const recycler = await userService.findRecyclerByEmail(email);

    if (!recycler) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (isAccountLocked(recycler.isLocked || false, recycler.lockedUntil || null)) {
      return res.status(403).json({
        error: getLockedAccountMessage(recycler.lockedUntil!)
      });
    }

    const isValid = await userService.verifyRecyclerCredentials(email, password);
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

    res.status(200).json({
      message: 'Login successful',
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        id: recycler.id,
        email: recycler.email,
        type: recycler.type
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await blacklistToken(token);
    }

    res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Logout failed' });
  }
};
