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

// Super Admin Sistem Hesabatları
router.get('/system/summary', authenticate, ReportController.getSuperAdminSystemSummary);
router.get('/system/trends', authenticate, ReportController.getSuperAdminSystemTrends);
router.get('/system/stores', authenticate, ReportController.getSuperAdminTopStores);
router.get('/system/users', authenticate, ReportController.getSuperAdminUserGrowth);
router.get('/system/health', authenticate, ReportController.getSuperAdminSystemHealth);
router.get('/system/stores/performance', authenticate, ReportController.getSuperAdminStorePerformance);
router.get('/system/stores/trends', authenticate, ReportController.getSuperAdminStoreTrends);
router.get('/system/users/stats', authenticate, ReportController.getSuperAdminUserDetailedStats);
router.get('/system/users/growth', authenticate, ReportController.getSuperAdminUserDetailedGrowth);
router.get('/system/users/recent', authenticate, ReportController.getSuperAdminRecentUsers);

export default router;
