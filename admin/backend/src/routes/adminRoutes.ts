import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../shared/middleware/authMiddleware';
import usersRoutes from '../modules/users/users.routes';

const router = express.Router();
router.post('/login', adminController.login);
router.get('/materials', authenticate, adminController.getAllMaterials);
router.get('/materials/:id', authenticate, adminController.getMaterialById);
router.post('/materials', authenticate, adminController.createMaterial);
router.put('/materials/:id', authenticate, adminController.updateMaterial);
router.delete('/materials/:id', authenticate, adminController.deleteMaterial);
router.use('/users', usersRoutes);
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
