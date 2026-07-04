import { query, schemaQualified } from '../config/database';

export interface Invitation {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
  storeId: string | null;
  invitedBy: string;
  token: string;
  password: string; // Hash olunmuş şifrə
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvitationData {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
  storeId?: string;
  invitedBy: string;
  token: string;
  password: string; // Hash olunmuş şifrə
  expiresAt: Date;
}

export class InvitationModel {
  static async create(data: CreateInvitationData): Promise<Invitation> {
    const result = await query(
      `INSERT INTO ${schemaQualified}."invitations" (
        id, email, name, role, store_id, invited_by, token, password, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.id,
        data.email,
        data.name,
        data.role,
        data.storeId || null,
        data.invitedBy,
        data.token,
        data.password,
        data.expiresAt,
      ]
    );
    
    return result.rows[0];
  }

  static async findByToken(token: string): Promise<Invitation | null> {
    const result = await query(
      `SELECT * FROM ${schemaQualified}."invitations" WHERE token = $1`,
      [token]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<Invitation | null> {
    const result = await query(
      `SELECT * FROM ${schemaQualified}."invitations" WHERE email = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1`,
      [email, 'PENDING']
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id: string, status: string): Promise<Invitation | null> {
    const result = await query(
      `UPDATE ${schemaQualified}."invitations" 
       SET status = $1, accepted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  }

  static async updateStatusByToken(token: string, status: string): Promise<Invitation | null> {
    const result = await query(
      `UPDATE ${schemaQualified}."invitations" 
       SET status = $1, accepted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE token = $2 RETURNING *`,
      [status, token]
    );
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM ${schemaQualified}."invitations" WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async deleteExpired(): Promise<number> {
    const result = await query(
      `DELETE FROM ${schemaQualified}."invitations" 
       WHERE expires_at < CURRENT_TIMESTAMP AND status = 'PENDING'
       RETURNING id`
    );
    return result.rowCount || 0;
  }

  static async updateTokenPasswordExpires(id: string, token: string, password: string, expiresAt: Date): Promise<Invitation | null> {
    const result = await query(
      `UPDATE ${schemaQualified}."invitations"
       SET token = $1, password = $2, expires_at = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [token, password, expiresAt, id]
    );
    return result.rows[0] || null;
  }
}