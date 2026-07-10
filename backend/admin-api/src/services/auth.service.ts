import { UserModel } from '../models/User.model';
import { comparePassword } from '../utils/bcrypt';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { InvitationService } from './invitation.service';
import { SecurityService } from './security.service';
import { query, schemaQualified } from '../config/database';

export class AuthService {
  private static async validatePassword(password: string) {
    const res = await query('SELECT password_complexity FROM public.security_settings LIMIT 1');
    const complexityEnabled = res.rows[0]?.password_complexity;
    if (complexityEnabled) {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!regex.test(password)) {
        throw new Error('Şifrə ən azı 8 simvol olmalı, tərkibində ən azı bir böyük hərf, bir kiçik hərf, bir rəqəm və bir xüsusi simvol (!@#$%^&*) olmalıdır.');
      }
    } else if (password.length < 6) {
      throw new Error('Şifrə ən azı 6 simvoldan ibarət olmalıdır.');
    }
  }

  static async login(email: string, password: string, meta?: { ip?: string; userAgent?: string }) {
    const user = await UserModel.findByEmail(email);
    
    // Log function for login_history
    const logAttempt = async (userId: string | null, isSuccessful: boolean, failureReason: string | null) => {
      try {
        await query(
          `INSERT INTO public.login_history (user_id, ip_address, user_agent, login_time, is_successful, failure_reason) 
           VALUES ($1, $2, $3, NOW(), $4, $5)`,
          [userId, meta?.ip || null, meta?.userAgent || null, isSuccessful, failureReason]
        );
      } catch (e) {
        console.error('Failed to log login_history:', e);
      }
    };

    if (!user) {
      await logAttempt(null, false, 'İstifadəçi tapılmadı');
      throw new Error('E-poçt və ya şifrə yanlışdır');
    }

    if (!user.is_active) {
      await logAttempt(user.id, false, 'Hesab deaktiv edilib');
      throw new Error('Hesabınız deaktiv edilib');
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await logAttempt(user.id, false, 'Hesab bloklanıb');
      throw new Error('Hesabınız çox sayda uğursuz girişə görə bloklanıb. Zəhmət olmasa bir qədər sonra yenidən cəhd edin.');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      // Increment failed attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil: Date | null = null;
      
      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lock
        await SecurityService.createAuditLog({
          userId: user.id,
          action: 'ACCOUNT_LOCKED',
          description: '5 dəfə yanlış şifrəyə görə hesab 15 dəqiqəlik bloklandı',
          ipAddress: meta?.ip,
          userAgent: meta?.userAgent,
        });
      }
      
      await query(
        `UPDATE ${schemaQualified}.users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
        [failedAttempts, lockedUntil, user.id]
      );
      
      await logAttempt(user.id, false, 'Yanlış şifrə');
      
      if (failedAttempts >= 5) {
        throw new Error('Hesabınız 5 dəfə yanlış şifrə yığıldığı üçün 15 dəqiqəlik bloklandı.');
      }
      throw new Error('E-poçt və ya şifrə yanlışdır');
    }

    // Successful login: reset failed attempts
    if (user.failed_login_attempts > 0 || user.locked_until) {
      await query(
        `UPDATE ${schemaQualified}.users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
        [user.id]
      );
    }

    // Fetch current token_version so the JWT carries it
    const tvResult = await query(
      `SELECT COALESCE(token_version, 0) AS token_version FROM ${schemaQualified}.users WHERE id = $1`,
      [user.id]
    );
    const tokenVersion: number = tvResult.rows[0]?.token_version ?? 0;

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.store_id || undefined,
      tokenVersion,
    });
    const refreshToken = generateRefreshToken({ id: user.id });
    await UserModel.updateRefreshToken(user.id, refreshToken);
    await UserModel.updateLastLogin(user.id);
    await logAttempt(user.id, true, null);

    // Write audit log
    await SecurityService.createAuditLog({
      userId: user.id,
      action: 'login',
      description: 'Sistemə daxil olundu',
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });

    return { user, token, refreshToken };
  }

  static async invite(data: { name: string; email: string; role: string; storeId?: string; invitedBy: string }) {
    return InvitationService.inviteUser(data);
  }

  static async acceptInvitation(token: string) {
    return InvitationService.acceptInvitation(token);
  }
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.validatePassword(newPassword);

    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error('İstifadəçi tapılmadı');
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
        throw new Error('Cari şifrə yanlışdır');
    }

    await UserModel.updatePassword(user.id, newPassword);

    if (user.must_change_password) {
        // Just in case, updatePassword already sets it to false, but we can do an extra update if needed,
        // or just let updatePassword handle it.
        await UserModel.update(user.id, { must_change_password: false });
    }

    await UserModel.updateRefreshToken(user.id, null);
  }
}
