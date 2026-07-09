import fs from 'fs';
import path from 'path';
import { query } from '../lib/db';
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

            // 2. Fetch data from each table
            for (const table of tables) {
                const dataResult = await query(`SELECT * FROM ${table}`);
                backupData[table] = dataResult.rows;
            }

            // 3. Convert to JSON and save to file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup-${timestamp}.json`;
            const filepath = path.join(BACKUP_DIR, filename);
            
            const jsonString = JSON.stringify(backupData, null, 2);
            const sizeBytes = Buffer.byteLength(jsonString, 'utf8');

            fs.writeFileSync(filepath, jsonString, 'utf8');

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
