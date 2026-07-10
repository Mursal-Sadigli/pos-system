import { UserModel } from '../models/User.mode';
import { comparePassword } from '../utils/bcrypt';
import { generateToken, generateRefreshToken, verifyRefreshToken, verifyToken } from '../utils/jwt';
import { InvitationService } from './invitation.service';
import { EmailService } from './email.service';

import { query } from '../config/database';

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

  static async login(email: string, password: string) {
    const userByEmail = await UserModel.findByEmail(email);
    if (!userByEmail) {
      throw new Error('E-poçt və ya şifrə yanlışdır');
    }

    const valid = await comparePassword(password, userByEmail.password);
    if (!valid) {
      throw new Error('E-poçt və ya şifrə yanlışdır');
    }

    const token = generateToken({
      id: userByEmail.id,
      email: userByEmail.email,
      role: userByEmail.role,
      storeId: userByEmail.store_id || undefined,
    });
    const refreshToken = generateRefreshToken({ id: userByEmail.id });

    await UserModel.updateRefreshToken(userByEmail.id, refreshToken);
    await UserModel.updateLastLogin(userByEmail.id);

    // findById ilə yenidən gətir — store_name JOIN ilə gəlir
    const user = await UserModel.findById(userByEmail.id) ?? userByEmail;

    return { user, token, refreshToken };
  }

  static async refreshToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // findById artıq store_name JOIN ilə gəlir
    const user = await UserModel.findById(payload.id);
    if (!user) {
      throw new Error('User not found');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: user.store_id || undefined,
    });

    return { token, user };
  }

  static async logout(userId: string) {
    await UserModel.updateRefreshToken(userId, null);
  }

  static async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    await this.validatePassword(newPassword);
    
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) {
      throw new Error('Cari şifrə yanlışdır');
    }

    await UserModel.updatePassword(user.id, newPassword);

    if (user.must_change_password || user.status === 'PENDING') {
      await UserModel.update(user.id, { status: 'ACTIVE' });
    }

    await UserModel.updateRefreshToken(user.id, null);
  }

  static async acceptInvitation(token: string) {
    return InvitationService.acceptInvitation(token);
  }

  static async invite(data: { name: string; email: string; role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER'; storeId?: string; invitedBy: string }) {
    return InvitationService.inviteUser(data);
  }

  static async resendInvite(email: string, invitedBy: string) {
    return InvitationService.resendInvite({ email, invitedBy });
  }

  static async forgotPassword(email: string) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Bu e-poçt ünvanı ilə istifadəçi tapılmadı');
    }
    const resetToken = generateToken({ id: user.id, email: user.email, role: user.role });
    await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken);
  }

  static async resetPassword(token: string, newPassword: string) {
    await this.validatePassword(newPassword);
    
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error('Şifrə sıfırlama tokeni etibarsızdır və ya müddəti bitib.');
    }
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw new Error('İstifadəçi tapılmadı');
    }
    await UserModel.updatePassword(user.id, newPassword);
    if (user.status === 'PENDING' || user.must_change_password) {
      await UserModel.update(user.id, { status: 'ACTIVE' });
    }
    await UserModel.updateRefreshToken(user.id, null);
  }
}
