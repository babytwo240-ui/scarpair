import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate } from '../shared/middleware/authMiddleware';
import usersRoutes from '../modules/users/users.routes';
import materialsRoutes from '../modules/materials/materials.routes';
import categoriesRoutes from '../modules/categories/categories.routes';
import ratingsRoutes from '../modules/ratings/ratings.routes';
import reportsRoutes from '../modules/reports/reports.routes';
import monitoringRoutes from '../modules/monitoring/monitoring.routes';
import authRoutes from '../modules/auth/auth.routes';

const router = express.Router();
router.use('', authRoutes);
router.use('/materials', materialsRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/ratings', ratingsRoutes);
router.use('/reports', reportsRoutes);
router.use('/monitoring', monitoringRoutes);
router.get('/statistics', authenticate, adminController.getStatistics);

export default router;
