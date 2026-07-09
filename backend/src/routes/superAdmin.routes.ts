import { Router } from 'express';
import { systemSettingsController } from '../controllers/systemSettings.controller';
// Add authentication and super admin authorization middleware here if available.
// For example:
// import { authenticate } from '../middleware/auth.middleware';
// import { authorize } from '../middleware/role.middleware';

const router = Router();

// General Settings
router.get('/settings/general', systemSettingsController.getGeneralSettings);
router.put('/settings/general', systemSettingsController.updateGeneralSettings);

export default router;
