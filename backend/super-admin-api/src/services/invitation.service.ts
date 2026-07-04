import crypto from 'crypto';
import { UserModel } from '../models/User.mode';
import { InvitationModel } from '../models/Invitation.model';
import { generateRandomPassword } from '../utils/passwordGenerator';
import { EmailService } from './email.service';
import { hashPassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';

export class InvitationService {
  static async inviteUser(data: {
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
    storeId?: string;
    invitedBy: string;
  }) {
    // 1. İstifadəçi artıq var?
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Bu email ilə artıq istifadəçi mövcuddur');
    }

    // 2. Eyni emaile yeni dəvət göndərməyə icazə veririk.

    // 3. Random şifrə yarat
    const randomPassword = generateRandomPassword(12);
    const hashedPassword = await hashPassword(randomPassword);
    
    // 4. Token yarat
    const invitationId = crypto.randomUUID();
    const token = generateToken({
      id: invitationId,
      email: data.email,
      role: data.role,
    });
    
    // 5. Expires at (48 saat)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    
    // 6. Dəvəti yarat
    const invitation = await InvitationModel.create({
      id: invitationId,
      email: data.email,
      name: data.name,
      role: data.role,
      storeId: data.storeId,
      invitedBy: data.invitedBy,
      token,
      password: hashedPassword,
      expiresAt,
    });
    
    // 7. Email göndər
    await EmailService.sendInvitationEmail({
      to: data.email,
      name: data.name,
      password: randomPassword,
      token: token,
      role: data.role,
      expiresAt: expiresAt,
    });
    
    return {
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
      password: randomPassword,
    };
  }

  static async acceptInvitation(token: string): Promise<{ user: any; invitation: any; alreadyAccepted: boolean }> {
    // 1. Dəvəti tap
    const invitation = await InvitationModel.findByToken(token);
    if (!invitation) {
      throw new Error('Dəvət tapılmadı');
    }

    // 2. Vaxtı keçib?
    if (new Date() > new Date(invitation.expiresAt)) {
      await InvitationModel.updateStatus(invitation.id, 'EXPIRED');
      throw new Error('Dəvətin müddəti bitib');
    }

    const existingUser = await UserModel.findByEmail(invitation.email);

    // Əgər dəvət artıq qəbul olunubsa, istifadəçiyə giriş imkanı veririk.
    if (invitation.status === 'ACCEPTED') {
      return {
        user: existingUser,
        invitation,
        alreadyAccepted: true,
      };
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Bu dəvət artıq qəbul edilib');
    }

    // Əgər eyni email ilə artıq hesab varsa, təkrar istifadəçi yaratmadan davam edirik.
    if (existingUser) {
      const updatedInvitation = await InvitationModel.updateStatus(invitation.id, 'ACCEPTED');
      return {
        user: existingUser,
        invitation: updatedInvitation,
        alreadyAccepted: true,
      };
    }

    // İstifadəçini yarat
    const user = await UserModel.create({
      name: invitation.name,
      email: invitation.email,
      password: invitation.password, // already hashed
      role: invitation.role,
      store_id: invitation.storeId ?? undefined,
      is_verified: true,
      must_change_password: true, // First login must change password
      isPasswordHashed: true,
    });

    // Dəvət statusunu yenilə, amma tokenı silməyin.
    const updatedInvitation = await InvitationModel.updateStatus(invitation.id, 'ACCEPTED');

    // Xoş gəldin emaili göndər
    await EmailService.sendWelcomeEmail({
      to: user.email,
      name: user.name,
    });

    return {
      user,
      invitation: updatedInvitation,
      alreadyAccepted: false,
    };
  }

  static async resendInvite(data: { email: string; invitedBy: string }) {
    const { email, invitedBy } = data;

    const invitation = await InvitationModel.findByEmail(email);
    if (!invitation) {
      throw new Error('Dəvət tapılmadı');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error(`Bu dəvət artıq ${invitation.status.toLowerCase()} olunub`);
    }

    // Yeni random şifrə və hash
    const randomPassword = generateRandomPassword(12);
    const hashedPassword = await hashPassword(randomPassword);

    // Yeni token
    const token = generateToken({ id: invitation.id, email: invitation.email, role: invitation.role });

    // Yeni expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Update invitation with new token/password/expiry
    const updated = await InvitationModel.updateTokenPasswordExpires(invitation.id, token, hashedPassword, expiresAt);
    if (!updated) {
      throw new Error('Dəvət yenilənərkən problem yarandı');
    }

    // Göndər email
    await EmailService.sendInvitationEmail({
      to: updated.email,
      name: updated.name,
      password: randomPassword,
      token,
      role: updated.role,
      expiresAt,
    });

    return {
      invitation: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        status: updated.status,
        expiresAt: updated.expiresAt,
      },
      password: randomPassword,
    };
  }
}