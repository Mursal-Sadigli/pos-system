import fs from 'fs';
import path from 'path';
import { query } from '../config/database';
import { BackupModel } from '../models/Backup.model';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export class BackupService {
    // Ensure backup directory exists
    private static ensureBackupDir() {
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
    }

    // Create a new backup
    static async createBackup(): Promise<any> {
        this.ensureBackupDir();

        try {
            // 1. Get all table names in public schema
            const tablesResult = await query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
            `);
            
            const tables = tablesResult.rows.map(r => r.table_name);
            const backupData: Record<string, any[]> = {};

            // 2. Fetch data from each table and build CSV content
            let csvContent = '';
            for (const table of tables) {
                const dataResult = await query(`SELECT * FROM ${table}`);
                const rows = dataResult.rows;
                
                csvContent += `--- CƏDVƏL: ${table} ---\n`;
                if (rows.length > 0) {
                    const headers = Object.keys(rows[0]).join(',');
                    csvContent += headers + '\n';
                    for (const row of rows) {
                        csvContent += Object.values(row).map(val => {
                            if (val === null || val === undefined) return '""';
                            const strVal = String(val);
                            return `"${strVal.replace(/"/g, '""')}"`;
                        }).join(',') + '\n';
                    }
                } else {
                    csvContent += 'MƏLUMAT YOXDUR\n';
                }
                csvContent += '\n';
            }

            // 3. Save to CSV file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup-${timestamp}.csv`;
            const filepath = path.join(BACKUP_DIR, filename);
            
            const sizeBytes = Buffer.byteLength(csvContent, 'utf8');

            fs.writeFileSync(filepath, csvContent, 'utf8');

            // 4. Save record to database
            const backupRecord = await BackupModel.create(filename, sizeBytes, 'COMPLETED');
            
            return backupRecord;
        } catch (error) {
            console.error('Backup creation failed:', error);
            throw new Error('Məlumat bazasının nüsxələnməsi zamanı xəta baş verdi.');
        }
    }

    // Get all backups
    static async getBackups() {
        return await BackupModel.getAll();
    }

    // Delete a backup
    static async deleteBackup(id: string): Promise<void> {
        const backup = await BackupModel.getById(id);
        if (!backup) {
            throw new Error('Nüsxə tapılmadı.');
        }

        const filepath = path.join(BACKUP_DIR, backup.filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        await BackupModel.delete(id);
    }

    // Get backup file path for downloading
    static async getBackupFilepath(id: string): Promise<{ filepath: string, filename: string }> {
        const backup = await BackupModel.getById(id);
        if (!backup) {
            throw new Error('Nüsxə tapılmadı.');
        }

        const filepath = path.join(BACKUP_DIR, backup.filename);
        if (!fs.existsSync(filepath)) {
            throw new Error('Nüsxə faylı serverdə tapılmadı.');
        }

        return { filepath, filename: backup.filename };
    }
}
