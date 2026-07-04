import { query, schemaQualified } from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
  permissions: string[];
  store_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  must_change_password: boolean;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'MUST_CHANGE_PASSWORD';
  invitation_token: string | null;
  invitation_expires_at: Date | null;
  invited_by: string | null;
  last_login: Date | null;
  refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
  store_id?: string;
  permissions?: string[];
  invited_by?: string;
  is_verified?: boolean;
  must_change_password?: boolean;
  isPasswordHashed?: boolean;
}

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    const password = data.isPasswordHashed ? data.password : await hashPassword(data.password);
    
    const result = await query(
      `INSERT INTO ${schemaQualified}.users (
        name, email, password, role, permissions, store_id,
        is_active, status, must_change_password, invitation_token, invitation_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.name,
        data.email.toLowerCase().trim(),
        password,
        data.role || 'CASHIER',
        JSON.stringify(data.permissions || []),
        data.store_id || null,
        true,
        'ACTIVE',
        data.must_change_password || true,
        null,
        null,
      ]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      `SELECT * FROM ${schemaQualified}.users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await query(
      `SELECT * FROM ${schemaQualified}.users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByIdWithPassword(id: string): Promise<User | null> {
    const result = await query(
      `SELECT * FROM ${schemaQualified}.users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async update(id: string, data: Partial<User> & { status?: string }): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const normalizedData: Record<string, any> = { ...data };

    if (normalizedData.status !== undefined) {
      const statusValue = String(normalizedData.status).toUpperCase();
      normalizedData.status = statusValue;
      if (normalizedData.is_active === undefined) {
        normalizedData.is_active = statusValue === 'ACTIVE';
      }
    }

    const fieldMap: Record<string, string> = {
      name: 'name',
      email: 'email',
      role: 'role',
      permissions: 'permissions',
      store_id: 'store_id',
      is_active: 'is_active',
      must_change_password: 'must_change_password',
      status: 'status',
      invitation_token: 'invitation_token',
      invitation_expires_at: 'invitation_expires_at',
      last_login: 'last_login',
      refresh_token: 'refresh_token',
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (normalizedData[key] !== undefined) {
        fields.push(`${dbField} = $${paramIndex++}`);
        values.push(normalizedData[key]);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE ${schemaQualified}.users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  }

  static async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await query(
      `UPDATE ${schemaQualified}.users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [refreshToken, id]
    );
  }

  static async updateLastLogin(id: string): Promise<void> {
    await query(
      `UPDATE ${schemaQualified}.users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  }

  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await hashPassword(newPassword);
    const result = await query(
      `UPDATE ${schemaQualified}.users SET password = $1, must_change_password = false, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`,
      [hashedPassword, id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM ${schemaQualified}.users WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async findAll({
    role,
    store_id,
    is_active,
    page = 1,
    limit = 20,
  }: {
    role?: string;
    store_id?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (role) {
      conditions.push(`u.role = $${paramIndex++}`);
      params.push(role);
    }

    if (store_id) {
      conditions.push(`u.store_id = $${paramIndex++}`);
      params.push(store_id);
    }

    if (is_active !== undefined) {
      conditions.push(`u.is_active = $${paramIndex++}`);
      params.push(is_active);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM ${schemaQualified}.users u ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT u.*, s.name as store_name 
       FROM ${schemaQualified}.users u
       LEFT JOIN public.stores s ON u.store_id = s.id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}