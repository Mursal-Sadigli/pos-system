import { UserModel } from '../models/User.model';
import { comparePassword } from '../utils/bcrypt';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { InvitationService } from './invitation.service';

export class AuthService {
  static async login(email: string, password: string) {
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

    const token = generateToken({ id: user.id, email: user.email, role: user.role, storeId: user.store_id || undefined });
    const refreshToken = generateRefreshToken({ id: user.id });
    await UserModel.updateRefreshToken(user.id, refreshToken);
    await UserModel.updateLastLogin(user.id);

    return { user, token, refreshToken };
  }

  static async invite(data: { name: string; email: string; role: string; storeId?: string; invitedBy: string }) {
    return InvitationService.inviteUser(data);
  }

  static async acceptInvitation(token: string) {
    return InvitationService.acceptInvitation(token);
  }
}
