import { Router } from 'express';
import { systemSettingsController } from '../controllers/systemSettings.controller';
// Add authentication and super admin authorization middleware here if available.
// For example:
// import { authenticate } from '../middleware/auth.middleware';
// import { authorize } from '../middleware/role.middleware';

const router = Router();

import { BackupController } from '../controllers/backup.controller';
// General Settings
router.get('/settings/general', systemSettingsController.getGeneralSettings);
router.put('/settings/general', systemSettingsController.updateGeneralSettings);

// Backups
router.get('/settings/backups', BackupController.getBackups);
router.post('/settings/backups', BackupController.createBackup);
router.delete('/settings/backups/:id', BackupController.deleteBackup);
router.get('/settings/backups/:id/download', BackupController.downloadBackup);

export default router;
