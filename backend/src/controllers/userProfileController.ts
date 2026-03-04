import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { isValidPhone, isStrongPassword } from '../utils/validators';
import { generateExpiry } from '../utils/passwordUtil';
import * as emailService from '../services/emailService';
import { logPasswordAudit } from '../utils/passwordAuditUtil';

const getUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user;

    if (!user) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let userDetails: any;
    if (user.type === 'business') {
      userDetails = await userService.findBusinessByEmail(user.email);
    } else {
      userDetails = await userService.findRecyclerByEmail(user.email);
    }

    if (!userDetails) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ error: 'User not found' });
    }

    const profileData: any = {};
    
    if (userDetails.id !== undefined && userDetails.id !== null) profileData.id = userDetails.id;
    if (userDetails.email !== undefined && userDetails.email !== null) profileData.email = userDetails.email;
    if (userDetails.type !== undefined && userDetails.type !== null) profileData.type = userDetails.type;
    if (userDetails.phone !== undefined && userDetails.phone !== null) profileData.phone = userDetails.phone;
    if (userDetails.isVerified !== undefined && userDetails.isVerified !== null) profileData.isVerified = userDetails.isVerified;

    if (user.type === 'business' && userDetails.businessName !== undefined && userDetails.businessName !== null) {
      profileData.businessName = userDetails.businessName;
    }
    if (user.type === 'recycler' && userDetails.companyName !== undefined && userDetails.companyName !== null) {
      profileData.companyName = userDetails.companyName;
    }
    if (user.type === 'recycler' && userDetails.specialization !== undefined && userDetails.specialization !== null) {
      profileData.specialization = userDetails.specialization;
    }

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Profile retrieved successfully',
      user: profileData
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const updateUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const { phone, businessName, companyName, specialization } = req.body;

    if (!user) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (phone && !isValidPhone(phone)) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const updates: any = {};
    if (phone) updates.phone = phone;
    if (businessName) updates.businessName = businessName;
    if (companyName) updates.companyName = companyName;
    if (specialization) updates.specialization = specialization;

    const updatedUser = await userService.updateUserProfile(user.email, user.type, updates);

    if ('error' in updatedUser) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: (updatedUser as any).error });
    }

    const userResponse: any = {};
    
    if (updatedUser.id !== undefined && updatedUser.id !== null) userResponse.id = updatedUser.id;
    if (updatedUser.email !== undefined && updatedUser.email !== null) userResponse.email = updatedUser.email;
    if (updatedUser.type !== undefined && updatedUser.type !== null) userResponse.type = updatedUser.type;
    if (updatedUser.phone !== undefined && updatedUser.phone !== null) userResponse.phone = updatedUser.phone;

    if (user.type === 'business' && updatedUser.businessName !== undefined && updatedUser.businessName !== null) {
      userResponse.businessName = updatedUser.businessName;
    }
    if (user.type === 'recycler' && updatedUser.companyName !== undefined && updatedUser.companyName !== null) {
      userResponse.companyName = updatedUser.companyName;
    }
    if (user.type === 'recycler' && updatedUser.specialization !== undefined && updatedUser.specialization !== null) {
      userResponse.specialization = updatedUser.specialization;
    }

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Profile updated successfully',
      user: userResponse
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const changePassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!user) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!currentPassword || !newPassword) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    let userDetails: any;
    if (user.type === 'business') {
      userDetails = await userService.findBusinessByEmail(user.email);
    } else {
      userDetails = await userService.findRecyclerByEmail(user.email);
    }

    if (!userDetails) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate new password using comprehensive validation
    const validation = await userService.validateNewPassword(
      user.email,
      user.type,
      currentPassword,
      newPassword
    );

    if (!validation.valid) {
      await logPasswordAudit(userDetails.id, user.email, user.type, 'change', req, 'failed', validation.error);
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: validation.error });
    }

    const passwordCheck = isStrongPassword(newPassword);
    if (!passwordCheck.valid) {
      await logPasswordAudit(userDetails.id, user.email, user.type, 'change', req, 'failed', 'Password does not meet requirements');
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({
        error: 'New password does not meet security requirements',
        requirements: passwordCheck.errors
      });
    }

    await userService.updateUserPassword(user.email, user.type, newPassword);

    // Log successful password change
    await logPasswordAudit(userDetails.id, user.email, user.type, 'change', req, 'success');

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Password changed successfully'
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to change password' });
  }
};

const deleteUserAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const { password } = req.body;

    if (!user) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!password) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    let userDetails: any;
    if (user.type === 'business') {
      userDetails = await userService.findBusinessByEmail(user.email);
    } else {
      userDetails = await userService.findRecyclerByEmail(user.email);
    }

    if (!userDetails) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({ error: 'User not found' });
    }

    const bcryptjs = require('bcryptjs');
    const isPasswordValid = await bcryptjs.compare(password, userDetails.password);
    if (!isPasswordValid) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({ error: 'Invalid password' });
    }

    const deleted = await userService.deleteUserAccount(user.email, user.type);

    if (!deleted) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Failed to delete account. You may have active waste posts or collections.' });
    }

    const displayName = user.type === 'business' ? userDetails.businessName : userDetails.companyName;
    await emailService.sendAccountDeletedEmail(user.email, displayName);

    res.setHeader('Content-Type', 'application/json');
    const responseBody = JSON.stringify({
      message: 'Account deleted successfully'
    });
    res.status(200).send(responseBody);
  } catch (error: any) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

export {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount
};

