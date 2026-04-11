import express from 'express';
import { getAllUserRatings, getAllPostRatings } from './ratings.controller';
import { authenticate } from '../../shared/middleware/authMiddleware';

const router = express.Router();

// All routes are protected by authenticate middleware
router.get('/user', authenticate, getAllUserRatings);
router.get('/post', authenticate, getAllPostRatings);

export default router;
