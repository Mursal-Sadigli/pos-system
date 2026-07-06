import { Router } from 'express';
import { getSalesSummary, getTopProducts } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/summary', authenticate as any, getSalesSummary as any);
router.get('/top-products', authenticate as any, getTopProducts as any);

export default router;
