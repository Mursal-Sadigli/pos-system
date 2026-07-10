import { Router } from 'express';
import { systemSettingsController } from '../controllers/systemSettings.controller';
import { SecuritySettingsController } from '../controllers/securitySettings.controller';

const router = Router();

// General Settings
router.get('/general', systemSettingsController.getGeneralSettings);
router.put('/general', systemSettingsController.updateGeneralSettings);

// Security Settings
router.get('/security', SecuritySettingsController.getSettings);
router.put('/security', SecuritySettingsController.updateSettings);

import { BackupController } from '../controllers/backup.controller';
// Backups
router.get('/backups', BackupController.getBackups);
router.post('/backups', BackupController.createBackup);
router.delete('/backups/:id', BackupController.deleteBackup);
router.get('/backups/:id/download', BackupController.downloadBackup);

export default router;
