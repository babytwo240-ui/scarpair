import express from 'express';
import * as collectionController from './collection.controller';
import { authenticateUser } from '../../middleware/userAuthMiddleware';
import { RateLimiter } from '../../middleware/rateLimiter';

const router = express.Router();

router.get('/available', collectionController.getAvailablePosts);
router.get('/', authenticateUser, collectionController.getUserCollections);
router.post('/request', authenticateUser, RateLimiter.middleware('createCollection'), collectionController.requestCollection);
router.put('/:collectionId/approve', authenticateUser, collectionController.approveCollection);
router.put('/:collectionId/reject', authenticateUser, collectionController.rejectCollection);

export default router;
