import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/User.model';
import { EmailService } from './email.service';
import { hashPassword } from '../utils/bcrypt';
import { query } from '../lib/db';

export class InvitationService {
    // Generate random strong password
    private static generateRandomPassword(): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*';

        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];

        const allChars = uppercase + lowercase + numbers + special;
        for (let i = password.length; i < 12; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    // Generate invite token
    private static generateInviteToken(): string {
        return uuidv4();
    }

    // Invite new user
    static async inviteUser(data: {
        name: string;
        email: string;
        role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
        storeId?: string;
        invitedBy: string;
    }): Promise<{ user: any; password: string; inviteToken: string }> {
        // Check if user already exists
        const existingUser = await UserModel.findByEmail(data.email);
        if (existingUser) {
            throw new Error('Bu e-poçt ünvanı ilə istifadəçi artıq mövcuddur');
        }

        // Allow sending a new invitation again for the same email.

        // Generate password and token
        const password = this.generateRandomPassword();
        const inviteToken = this.generateInviteToken();
        const inviteTokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user with PENDING status
        const result = await query(
            `INSERT INTO users (name, email, password, role, store_id, status, invite_token, invite_token_expires_at, must_change_password)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                data.name,
                data.email.toLowerCase().trim(),
                hashedPassword,
                data.role,
                data.storeId || null,
                'PENDING',
                inviteToken,
                inviteTokenExpiresAt,
                true,
            ]
        );

        const user = result.rows[0];

        // Send invitation email
        await EmailService.sendInvitationEmail({
            email: data.email,
            name: data.name,
            password: password,
            inviteToken: inviteToken,
            role: data.role,
        }).catch(console.error);

        // Log activity
        await this.logActivity(data.invitedBy, 'CREATE_USER_INVITATION', 'user', user.id, {
            email: data.email,
            role: data.role,
        });

        return {
            user: user,
            password: password,
            inviteToken: inviteToken,
        };
    }

    // Accept invitation
    static async acceptInvitation(inviteToken: string): Promise<any> {
        // Find user by invite token
        const user = await UserModel.findByInviteToken(inviteToken);
        if (!user) {
            throw new Error('Dəvət linki tapılmadı və ya müddəti bitib');
        }

        const inviteResult = await query(
            `SELECT invite_token, invite_token_expires_at FROM users WHERE id=$1`,
            [user.id]
        );

        if (!inviteResult.rows[0]) {
            throw new Error('Dəvət məlumatı tapılmadı.');
        }

        if (new Date(inviteResult.rows[0].invite_token_expires_at) <= new Date()) {
            throw new Error('Dəvətin müddəti bitib');
        }

        // Allow up to 2 uses for the same invite token.
        const updatedUser = await query(
            `UPDATE users SET status=$1, must_change_password=$2, updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *`,
            ['MUST_CHANGE_PASSWORD', true, user.id]
        );

        if (!updatedUser.rows[0]) {
            throw new Error('Dəvət qəbul edilərkən problem yarandı.');
        }

        return updatedUser.rows[0];
    }

    // Resend invitation
    static async resendInvitation(userId: string, invitedBy: string): Promise<void> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('İstifadəçi tapılmadı');
        }

        if (user.status !== 'PENDING') {
            throw new Error('Dəvət yalnız PENDING statusunda olan istifadəçilərə göndərilə bilər');
        }

        // Generate new invite token
        const inviteToken = this.generateInviteToken();
        const inviteTokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

        await UserModel.updateInviteToken(userId, inviteToken, inviteTokenExpiresAt);

        // Send invitation email again
        await EmailService.sendInvitationEmail({
            email: user.email,
            name: user.name,
            password: '****',
            inviteToken: inviteToken,
            role: user.role as any,
        }).catch(console.error);

        // Log activity
        await this.logActivity(invitedBy, 'RESEND_INVITATION', 'user', userId, {
            email: user.email,
        });
    }

    // Helper: Log activity
    private static async logActivity(
        userId: string,
        action: string,
        entityType: string,
        entityId: string,
        changes: any
    ): Promise<void> {
        try {
            await query(
                `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, changes)
                VALUES ($1, $2, $3, $4, $5)`,
                [userId, action, entityType, entityId, JSON.stringify(changes)]
            );
        } catch (error) {
            console.error('Activity log error:', error);
        }
    }
}
