import crypto from 'crypto';
import { UserModel } from '../models/User.model';
import { InvitationModel } from '../models/Invitation.model';
import { generateRandomPassword } from '../utils/passwordGenerator';
import { EmailService } from './email.service';

export class InvitationService {
  static async inviteUser(data: {
    name: string;
    email: string;
    role: string;
    storeId?: string;
    invitedBy: string;
  }) {
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Bu email ilə artıq istifadəçi mövcuddur');
    }

    const existingInvitation = await InvitationModel.findByEmail(data.email);
    if (existingInvitation) {
      throw new Error('Bu email üçün artıq aktiv dəvət mövcuddur');
    }

    const password = generateRandomPassword(12);
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const invitation = await InvitationModel.create({
      email: data.email,
      name: data.name,
      role: data.role,
      store_id: data.storeId,
      invited_by: data.invitedBy,
      token,
      password,
      expires_at: expiresAt,
    });

    await EmailService.sendInvitationEmail({
      to: data.email,
      name: data.name,
      password,
      token,
      role: data.role,
    });

    return { invitation, password };
  }

  static async acceptInvitation(token: string) {
    const invitation = await InvitationModel.findByToken(token);
    if (!invitation) {
      throw new Error('Dəvət tapılmadı');
    }
    if (invitation.status !== 'PENDING') {
      throw new Error('Bu dəvət artıq istifadə olunub və ya müddəti bitib');
    }
    if (new Date(invitation.expires_at) < new Date()) {
      await InvitationModel.updateStatus(invitation.id, 'EXPIRED');
      throw new Error('Dəvətin müddəti bitib');
    }

    const user = await UserModel.create({
      name: invitation.name,
      email: invitation.email,
      password: invitation.password,
      role: invitation.role as any,
      store_id: invitation.store_id,
      invited_by: invitation.invited_by,
      is_verified: true,
      must_change_password: true,
      isPasswordHashed: true,
    });

    await InvitationModel.updateStatus(invitation.id, 'ACCEPTED');
    return user;
  }
}
