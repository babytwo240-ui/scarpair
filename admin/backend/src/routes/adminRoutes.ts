import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../shared/middleware/authMiddleware';
import usersRoutes from '../modules/users/users.routes';
import materialsRoutes from '../modules/materials/materials.routes';
import categoriesRoutes from '../modules/categories/categories.routes';
import ratingsRoutes from '../modules/ratings/ratings.routes';
import reportsRoutes from '../modules/reports/reports.routes';

const router = express.Router();
router.post('/login', adminController.login);
router.use('/materials', materialsRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/ratings', ratingsRoutes);
router.use('/reports', reportsRoutes);
router.get('/logs', authenticate, adminController.getSystemLogs);
router.delete('/logs', authenticate, adminController.clearSystemLogs);
router.get('/statistics', authenticate, adminController.getStatistics);

export default router;
