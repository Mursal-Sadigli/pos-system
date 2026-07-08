import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Bütün hesabat routeları auth tələb edir
router.get('/summary', authenticate, ReportController.getSalesSummary);
router.get('/top-products', authenticate, ReportController.getTopProducts);
router.get('/by-category', authenticate, ReportController.getByCategory);
router.get('/inventory', authenticate, ReportController.getInventoryReport);
router.post('/send-email', authenticate, ReportController.sendReportEmail);

export default router;
