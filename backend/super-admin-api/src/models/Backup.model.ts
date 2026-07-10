import { query } from '../config/database';

export interface Backup {
    id: string;
    filename: string;
    size_bytes: number;
    status: string;
    created_at: Date;
}

export class BackupModel {
    static async getAll(): Promise<Backup[]> {
        const result = await query(
            'SELECT * FROM backups ORDER BY created_at DESC'
        );
        return result.rows;
    }

    static async getById(id: string): Promise<Backup | null> {
        const result = await query(
            'SELECT * FROM backups WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async create(filename: string, sizeBytes: number, status: string = 'COMPLETED'): Promise<Backup> {
        const result = await query(
            `INSERT INTO backups (filename, size_bytes, status)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [filename, sizeBytes, status]
        );
        return result.rows[0];
    }

    static async updateStatus(id: string, status: string): Promise<void> {
        await query(
            `UPDATE backups SET status = $1 WHERE id = $2`,
            [status, id]
        );
    }

    static async delete(id: string): Promise<void> {
        await query(
            'DELETE FROM backups WHERE id = $1',
            [id]
        );
    }
}
