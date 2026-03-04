import express from 'express';
import * as materialController from '../controllers/materialController';

const router = express.Router();

router.post('/', materialController.createMaterial);
router.get('/', materialController.getAllMaterials);
router.get('/recommended', materialController.getRecommendedMaterials);

export default router;
