import express from 'express';
import * as adminController from '../controllers/adminController';
import * as userManagementController from '../controllers/userManagementController';
import { authenticate } from '../middleware/authMiddleware';
import { sequelize } from '../models';

const router = express.Router();
router.post('/login', adminController.login);
router.get('/debug/db-status', async (req: any, res: any) => {
  try {
    const User = (sequelize as any).models.User;
    if (!User) {
      return res.status(500).json({ 
        error: 'User model not initialized',
        availableModels: Object.keys((sequelize as any).models || {})
      });
    }
    const count = await User.count();
    const sample = await User.findAll({ limit: 3, raw: true });
    res.status(200).json({
      status: 'Database connected',
      userCount: count,
      sampleUsers: sample
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Database error',
      details: error.message,
      stack: error.stack
    });
  }
});
router.get('/materials', authenticate, adminController.getAllMaterials);
router.get('/materials/:id', authenticate, adminController.getMaterialById);
router.post('/materials', authenticate, adminController.createMaterial);
router.put('/materials/:id', authenticate, adminController.updateMaterial);
router.delete('/materials/:id', authenticate, adminController.deleteMaterial);
router.get('/users', authenticate, userManagementController.getAllUsers);
router.get('/users/:id', authenticate, userManagementController.getUserById);
router.put('/users/:id/verify', authenticate, userManagementController.toggleUserVerification);
router.delete('/users/:id', authenticate, userManagementController.deleteUser);
router.get('/categories', authenticate, adminController.getWasteCategories);
router.post('/categories', authenticate, adminController.createWasteCategory);
router.put('/categories/:categoryId', authenticate, adminController.updateWasteCategory);
router.delete('/categories/:categoryId', authenticate, adminController.deleteWasteCategory);
router.get('/ratings/users', authenticate, adminController.getAllUserRatings);
router.get('/ratings/posts', authenticate, adminController.getAllPostRatings);
router.get('/reports', authenticate, adminController.getAllReports);
router.get('/logs', authenticate, adminController.getSystemLogs);
router.get('/statistics', authenticate, adminController.getStatistics);

export default router;

