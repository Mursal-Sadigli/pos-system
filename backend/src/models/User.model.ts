import { query } from "../lib/db";
import { hashPassword } from "../utils/bcrypt";


export interface User{
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
    permissions: string[];
    storeId: string | null;
    rfidCard: string | null;
    isActive: boolean;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'MUST_CHANGE_PASSWORD';
    lastLogin: Date | null;
    refreshToken: string | null;
    inviteToken: string | null;
    inviteTokenExpiresAt: Date | null;
    mustChangePassword: boolean;
    createdAt: Date;
    updatedAt: Date;  
}

export interface CreateUserData{
    name: string;
    email: string;
    password: string;
    role?: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
    storeId?: string;
    permissions?: string[];
}

export class UserModel{
    private static mapUser(row: any): User {
        const isActive = row.is_active ?? row.isActive;
        const status = row.status ?? 'PENDING';
        const mustChangePassword = row.must_change_password ?? true;

        return {
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            role: row.role,
            permissions: Array.isArray(row.permissions) ? row.permissions : [],
            storeId: row.store_id ?? row.storeId ?? null,
            rfidCard: row.rfid_card ?? row.rfidCard ?? null,
            isActive: isActive === undefined ? true : Boolean(isActive),
            status: status,
            lastLogin: row.last_login ?? row.lastLogin ?? null,
            refreshToken: row.refresh_token ?? row.refreshToken ?? null,
            inviteToken: row.invite_token ?? row.inviteToken ?? null,
            inviteTokenExpiresAt: row.invite_token_expires_at ?? row.inviteTokenExpiresAt ?? null,
            mustChangePassword: Boolean(mustChangePassword),
            createdAt: row.created_at ?? row.createdAt ?? new Date(),
            updatedAt: row.updated_at ?? row.updatedAt ?? new Date(),
        };
    }

    // Create user
    static async create(data: CreateUserData): Promise<User>{
        const hashedPassword=await hashPassword(data.password);

        const result=await query(
            `INSERT INTO users (name, email, password, role, store_id, status, must_change_password)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [data.name, data.email.toLowerCase().trim(), hashedPassword, data.role || 'CASHIER', data.storeId || null, 'ACTIVE', false]
        );

        return this.mapUser(result.rows[0]);
    }

    // Find by email
    static async findByEmail(email: string): Promise<User | null>{
        const result=await query(
            `SELECT * FROM users WHERE email=$1`,
            [email.toLowerCase().trim()]
        );
        return result.rows[0] ? this.mapUser(result.rows[0]) : null;
    }

    // Find by id
    static async findById(id: string): Promise<User | null>{
        const result=await query(
            `SELECT * FROM users WHERE id=$1`,
            [id]
        );
        return result.rows[0] ? this.mapUser(result.rows[0]) : null;
    }

    // Find by invite token
    static async findByInviteToken(token: string): Promise<User | null>{
        const result=await query(
            `SELECT * FROM users WHERE invite_token=$1 AND invite_token_expires_at > NOW()`,
            [token]
        );
        return result.rows[0] ? this.mapUser(result.rows[0]) : null;
    }

    // Find by ID with password (for login)
    static async findByIdWithPassword(id: string): Promise<User | null>{
        const result=await query(
            `SELECT * FROM users WHERE id=$1`,
            [id]
        );
        return result.rows[0] ? this.mapUser(result.rows[0]) : null;
    }

    // Update user
    static async update(id: string, data: Partial<User>): Promise<User | null>{
        const fields: string[]=[];
        const values: any[]=[];
        let paramIndex=1;

        const fieldMap: Record<string, string> ={
            name: 'name',
            email: 'email',
            role: 'role',
            permissions: 'permissions',
            storeId: 'store_id',
            rfidCard: 'rfid_card',
            isActive: 'is_active',
            status: 'status',
            refreshToken: 'refresh_token',
            mustChangePassword: 'must_change_password',
        };

        for (const [key, dbField] of Object.entries(fieldMap)){
            if(data[key as keyof User] !== undefined){
                fields.push(`${dbField}=$${paramIndex++}`);
                values.push(data[key as keyof User]);
            }
        }

        if(fields.length===0) return null;

        values.push(id);
        const result=await query(
            `UPDATE users SET ${fields.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id=$${paramIndex} RETURNING *`,
            values
        );

        return result.rows[0] ? this.mapUser(result.rows[0]) : null;
    }

    // Update refresh token
    static async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
        await query(
            `UPDATE users SET refresh_token=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2`,
            [refreshToken, id]
        );
    }

    // Update invite token
    static async updateInviteToken(id: string, inviteToken: string, expiresAt: Date): Promise<void> {
        await query(
            `UPDATE users SET invite_token=$1, invite_token_expires_at=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`,
            [inviteToken, expiresAt, id]
        );
    }

    // Set must change password
    static async setMustChangePassword(id: string, mustChange: boolean): Promise<void> {
        await query(
            `UPDATE users SET must_change_password=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2`,
            [mustChange, id]
        );
    }

    // Update last login
    static async updateLastLogin(id: string): Promise<void> {
        await query(
            `UPDATE users SET last_login=CURRENT_TIMESTAMP WHERE id=$1`,
            [id]
        );
    }

    // Update password
    static async updatePassword(id: string, newPassword: string): Promise<boolean>{
        const hashedPassword=await hashPassword(newPassword);
        const result=await query(
                `UPDATE users SET password=$1, must_change_password=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING id`,
                [hashedPassword, false, id]
        );
        return result.rowCount !== null && result.rowCount>0;
    }

    // Delete user
    static async delete(id: string): Promise<boolean>{
        const result=await query(
            `DELETE FROM users WHERE id=$1 RETURNING id`,
            [id]
        );
        return result.rowCount !== null && result.rowCount>0;
    }

    // Deactivate user
    static async deactivate(id: string): Promise<void> {
        await query(
            `UPDATE users SET is_active=$1, status=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`,
            [false, 'INACTIVE', id]
        );
    }

    // Activate user
    static async activate(id: string): Promise<void> {
        await query(
            `UPDATE users SET is_active=$1, status=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3`,
            [true, 'ACTIVE', id]
        );
    }

    // Find all users
    static async findAll({storeId, role, status, page=1, limit=20, }: {
        storeId?: string;
        role?: string;
        status?: string;
        page?: number;
        limit?: number;
    } = {}){
        const offset=(page-1)*limit;
        const conditions: string[]=[];
        const params: any[]=[];
        let paramIndex=1;

        if(storeId){
            conditions.push(`store_id=$${paramIndex++}`);
            params.push(storeId);
        }

        if(role){
            conditions.push(`role=$${paramIndex++}`);
            params.push(role);
        }

        if(status){
            conditions.push(`status=$${paramIndex++}`);
            params.push(status);
        }

        const whereClause=conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Count total users
        const countResult=await query(
            `SELECT COUNT(*) FROM users ${whereClause}`,
            params
        );
        const total=parseInt(countResult.rows[0].count);

        // Get users
        params.push(limit, offset);
        const result=await query(
            `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        return {
            users: result.rows.map((row: any) => this.mapUser(row)),
            pagination: {
                page, limit, total, totalPages: Math.ceil(total/limit),
            },
        };
    }
}