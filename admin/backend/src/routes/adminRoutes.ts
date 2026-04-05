import express from 'express';
import * as adminController from '../controllers/adminController';
import * as userManagementController from '../controllers/userManagementController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();
router.post('/login', adminController.login);
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
router.delete('/logs', authenticate, adminController.clearSystemLogs);
router.get('/statistics', authenticate, adminController.getStatistics);

export default router;
