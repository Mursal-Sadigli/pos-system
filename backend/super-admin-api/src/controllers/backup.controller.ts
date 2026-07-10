import { Request, Response } from 'express';
import { BackupService } from '../services/backup.service';
import { successResponse, errorResponse } from '../utils/response';

export class BackupController {
    // Get list of backups
    static async getBackups(req: Request, res: Response) {
        try {
            const backups = await BackupService.getBackups();
            return successResponse(res, backups, 'Nüsxələr siyahısı uğurla alındı.');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // Create a new backup
    static async createBackup(req: Request, res: Response) {
        try {
            const backup = await BackupService.createBackup();
            return successResponse(res, backup, 'Məlumat bazası uğurla nüsxələndi.', 201);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // Delete a backup
    static async deleteBackup(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await BackupService.deleteBackup(id);
            return successResponse(res, null, 'Nüsxə uğurla silindi.');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // Download a backup file
    static async downloadBackup(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { filepath, filename } = await BackupService.getBackupFilepath(id);
            
            res.download(filepath, filename, (err) => {
                if (err) {
                    console.error('Download error:', err);
                    if (!res.headersSent) {
                        return errorResponse(res, 'Faylı yükləmək mümkün olmadı.', 500);
                    }
                }
            });
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }
}
