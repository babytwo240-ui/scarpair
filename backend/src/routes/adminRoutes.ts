import express from 'express';
import * as adminController from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/adminAuthMiddleware';

const router = express.Router();

router.use(authenticateAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/verify', adminController.verifyUser);
router.delete('/users/:id/delete', adminController.deleteUserAdmin);
router.put('/users/:userId/deactivate', adminController.deactivateUser);
router.put('/users/:userId/reactivate', adminController.reactivateUser);

router.post('/categories', adminController.createWasteCategory);
router.get('/categories', adminController.getWasteCategories);
router.put('/categories/:categoryId', adminController.updateWasteCategory);
router.delete('/categories/:categoryId', adminController.deleteWasteCategory);

router.get('/logs', adminController.getSystemLogs);
router.get('/logs/:action', adminController.getLogsByAction);

router.get('/ratings/users', adminController.getAllUserRatingsAdmin);
router.get('/ratings/posts', adminController.getAllPostRatingsAdmin);

router.get('/reports', adminController.getAllReportsAdmin);

router.post('/seed-test-data', adminController.seedTestData);

export default router;
