import { query, schemaQualified } from '../config/database';
import { hashPassword } from '../utils/bcrypt';
import type { CreateUserData, User } from '../types/user.types';

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    const password = data.isPasswordHashed ? data.password : await hashPassword(data.password);

    const result = await query(
      `INSERT INTO ${schemaQualified}.users (
        name, email, password, role, permissions, store_id,
        invited_by, is_verified, must_change_password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.name,
        data.email.toLowerCase().trim(),
        password,
        data.role || 'CASHIER',
        data.permissions || [],
        data.store_id || null,
        data.invited_by || null,
        data.is_verified || false,
        data.must_change_password ?? true,
      ]
    );

    return result.rows[0];
  }

  static async findByEmail(email: string) {
    const result = await query(`SELECT * FROM ${schemaQualified}.users WHERE email = $1`, [email.toLowerCase().trim()]);
    return result.rows[0] || null;
  }

  static async findById(id: string) {
    const result = await query(`SELECT * FROM ${schemaQualified}.users WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, data: Partial<User>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      name: 'name',
      last_name: 'last_name',
      email: 'email',
      phone: 'phone',
      role: 'role',
      permissions: 'permissions',
      store_id: 'store_id',
      is_active: 'is_active',
      is_verified: 'is_verified',
      must_change_password: 'must_change_password',
      invitation_token: 'invitation_token',
      invitation_expires_at: 'invitation_expires_at',
      last_login: 'last_login',
      refresh_token: 'refresh_token',
      password: 'password',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (data[key as keyof User] !== undefined) {
        fields.push(`${column} = $${idx++}`);
        values.push(data[key as keyof User]);
      }
    }

    if (!fields.length) return null;

    values.push(id);
    const result = await query(
      `UPDATE ${schemaQualified}.users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async updateRefreshToken(id: string, token: string | null) {
    await query(`UPDATE ${schemaQualified}.users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [token, id]);
  }

  static async updateStoreId(id: string, storeId: string) {
    await query(`UPDATE ${schemaQualified}.users SET store_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [storeId, id]);
  }


  static async updateLastLogin(id: string) {
    await query(`UPDATE ${schemaQualified}.users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
  }

  static async updatePassword(id: string, newPassword: string) {
    const hashed = await hashPassword(newPassword);
    const result = await query(
      `UPDATE ${schemaQualified}.users SET password = $1, must_change_password = false, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`,
      [hashed, id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async delete(id: string) {
    const result = await query(`DELETE FROM ${schemaQualified}.users WHERE id = $1 RETURNING id`, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findAll({ role, store_id, is_active, page = 1, limit = 20 }: {
    role?: string;
    store_id?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const offset = (page - 1) * limit;
    const filters: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (role) {
      filters.push(`role = $${idx++}`);
      values.push(role);
    }
    if (store_id) {
      filters.push(`store_id = $${idx++}`);
      values.push(store_id);
    }
    if (is_active !== undefined) {
      filters.push(`is_active = $${idx++}`);
      values.push(is_active);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) FROM ${schemaQualified}.users ${where}`, values);
    const total = parseInt(countRes.rows[0].count, 10);

    values.push(limit, offset);
    const dataRes = await query(
      `SELECT * FROM ${schemaQualified}.users ${where} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return { users: dataRes.rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
