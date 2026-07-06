import { query, schemaQualified } from '../config/database';

export interface Invitation {
  id: string;
  email: string;
  name: string;
  role: string;
  store_id: string | null;
  invited_by: string;
  token: string;
  password: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expires_at: Date;
  accepted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvitationData {
  email: string;
  name: string;
  role: string;
  store_id?: string;
  invited_by: string;
  token: string;
  password: string;
  expires_at: Date;
}

export class InvitationModel {
  static async create(data: CreateInvitationData) {
    const result = await query(
      `INSERT INTO ${schemaQualified}."invitations" (
        email, name, role, store_id, invited_by, token, password, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        data.email.toLowerCase().trim(),
        data.name,
        data.role,
        data.store_id || null,
        data.invited_by,
        data.token,
        data.password,
        data.expires_at,
      ]
    );
    return result.rows[0];
  }

  static async findByToken(token: string) {
    const result = await query(`SELECT * FROM ${schemaQualified}."invitations" WHERE token = $1`, [token]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string) {
    const result = await query(
      `SELECT * FROM ${schemaQualified}."invitations" WHERE email = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase().trim(), 'PENDING']
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id: string, status: string) {
    const result = await query(
      `UPDATE ${schemaQualified}."invitations" SET status = $1, accepted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  }
}
