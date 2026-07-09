import { UserModel } from '../models/User.model';
import { comparePassword } from '../utils/bcrypt';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { InvitationService } from './invitation.service';
import { SecurityService } from './security.service';
import { query, schemaQualified } from '../config/database';

export class AuthService {
  static async login(email: string, password: string, meta?: { ip?: string; userAgent?: string }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('E-poçt və ya şifrə yanlışdır');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new Error('E-poçt və ya şifrə yanlışdır');
    }

    if (!user.is_active) {
      throw new Error('Hesabınız deaktiv edilib');
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
