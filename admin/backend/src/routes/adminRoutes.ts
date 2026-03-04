import express from 'express';
import * as adminController from '../controllers/adminController';
import * as userManagementController from '../controllers/userManagementController';
import { authenticate } from '../middleware/authMiddleware';
import { sequelize } from '../models';

const router = express.Router();

// Public routes
router.post('/login', adminController.login);

// DEBUG: Test database connection (remove in production)
router.get('/debug/db-status', async (req: any, res: any) => {
  try {
    console.log('🔍 Debug endpoint called');
    console.log('Available models:', Object.keys((sequelize as any).models || {}));
    
    const User = (sequelize as any).models.User;
    console.log('User model:', User ? 'Found' : 'NOT FOUND');
    
    if (!User) {
      return res.status(500).json({ 
        error: 'User model not initialized',
        availableModels: Object.keys((sequelize as any).models || {})
      });
    }

    console.log('Counting users...');
    const count = await User.count();
    console.log(`✓ Found ${count} users`);
    
    const sample = await User.findAll({ limit: 3, raw: true });
    console.log(`✓ Retrieved ${sample.length} sample users`);
    
    res.status(200).json({
      status: 'Database connected',
      userCount: count,
      sampleUsers: sample
    });
  } catch (error: any) {
    console.error('❌ Debug endpoint error:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: 'Database error',
      details: error.message,
      stack: error.stack
    });
  }
});

// Protected routes (requires authentication)
router.get('/materials', authenticate, adminController.getAllMaterials);
router.get('/materials/:id', authenticate, adminController.getMaterialById);
router.post('/materials', authenticate, adminController.createMaterial);
router.put('/materials/:id', authenticate, adminController.updateMaterial);
router.delete('/materials/:id', authenticate, adminController.deleteMaterial);

// User Management Routes
router.get('/users', authenticate, userManagementController.getAllUsers);
router.get('/users/:id', authenticate, userManagementController.getUserById);
router.put('/users/:id/verify', authenticate, userManagementController.toggleUserVerification);
router.delete('/users/:id', authenticate, userManagementController.deleteUser);

// Waste Categories Routes
router.get('/categories', authenticate, adminController.getWasteCategories);
router.post('/categories', authenticate, adminController.createWasteCategory);
router.put('/categories/:categoryId', authenticate, adminController.updateWasteCategory);
router.delete('/categories/:categoryId', authenticate, adminController.deleteWasteCategory);

// Ratings Routes
router.get('/ratings/users', authenticate, adminController.getAllUserRatings);
router.get('/ratings/posts', authenticate, adminController.getAllPostRatings);

// Reports Routes
router.get('/reports', authenticate, adminController.getAllReports);

// System Logs Routes
router.get('/logs', authenticate, adminController.getSystemLogs);

// Statistics
router.get('/statistics', authenticate, adminController.getStatistics);

export default router;
