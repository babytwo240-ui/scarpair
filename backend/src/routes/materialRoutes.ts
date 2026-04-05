import express from 'express';
import * as materialController from '../controllers/materialController';
import { RateLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.post('/', RateLimiter.middleware('createMaterial'), materialController.createMaterial);
router.get('/', materialController.getAllMaterials);
router.get('/recommended', materialController.getRecommendedMaterials);

export default router;
