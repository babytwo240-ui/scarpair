import express from 'express';
import * as reportController from '../controllers/reportController';
import { authenticateUser } from '../middleware/userAuthMiddleware';
import { authenticateAdmin } from '../middleware/adminAuthMiddleware';

const router = express.Router();
router.use(authenticateUser);
router.post('/', reportController.submitReport);
router.get('/my-reports', reportController.getUserReports);
router.get('/admin/pending', authenticateAdmin, reportController.getPendingReports);
router.get('/admin/all', authenticateAdmin, reportController.getAllReports);
router.put('/admin/:reportId/approve', authenticateAdmin, reportController.approveReport);
router.put('/admin/:reportId/reject', authenticateAdmin, reportController.rejectReport);

export default router;
