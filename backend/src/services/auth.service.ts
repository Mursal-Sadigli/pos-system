import { CreateUserData, UserModel } from "../models/User.model";
import { comparePassword } from "../utils/bcrypt";
import { generateRefreshToken, generateToken, TokenPayload, verifyRefreshToken, verifyToken } from "../utils/jwt";
import { EmailService } from "./email.service";
import { InvitationService } from "./invitation.service";

export class AuthService{
    // ==================== Register user ====================
    static async register(data: CreateUserData){
        // check if user exists
        const existingUser=await UserModel.findByEmail(data.email);
        if(existingUser){
            throw new Error('Bu e-poçt ünvanı ilə artıq istifadəçi mövcuddur');
        }

        // Create user
        const user=await UserModel.create(data);

        // Generate tokens
        const tokenPayload: TokenPayload={
            id: user.id, email: user.email, role: user.role, storeId: user.storeId || undefined,
        };

        const token=generateToken(tokenPayload);
        const refreshToken=generateRefreshToken({
            id: user.id,
            email: user.email,
            role: user.role,
            storeId: user.storeId || undefined,
        });

        // Persist refresh token
        await UserModel.updateRefreshToken(user.id, refreshToken);

        // send welcome email
        EmailService.sendWelcomeEmail(user.email, user.name).catch(console.error);

        return {
            user: {
                id: user.id, name: user.name, email: user.email, role: user.role, storeId: user.storeId,
            }, token, refreshToken,
        };
    }

    // ==================== Login user ====================
    static async login(email: string, password: string){
        // find user with password
        const user=await UserModel.findByEmail(email);
        if(!user){
            throw new Error('E-poçt və ya şifrə yanlışdır.');
        }

        if(user.status === 'PENDING'){
            throw new Error('Hesabınız hələ aktivləşdirilməyib. Dəvət linkini yoxlayın.');
        }

        if(user.status === 'SUSPENDED'){
            throw new Error('Hesabınız dayandırılıb. Zəhmət olmasa inzibatçı ilə əlaqə saxlayın.');
        }

        if(!user.isActive || user.status === 'INACTIVE'){
            throw new Error('Hesabınız deaktiv edilib.');
        }

        // verify password
        const isValid=await comparePassword(password, user.password);
        if(!isValid){
            throw new Error('E-poçt və ya şifrə yanlışdır.');
        }

        // update last login
        await UserModel.updateLastLogin(user.id);

        // generate tokens
        const tokenPayload: TokenPayload={
            id: user.id, email: user.email, role: user.role, storeId: user.storeId || undefined,
        };

        const token=generateToken(tokenPayload);
        const refreshToken=generateRefreshToken({
            id: user.id,
            email: user.email,
            role: user.role,
            storeId: user.storeId || undefined,
        });

        // save refresh token
        await UserModel.updateRefreshToken(user.id, refreshToken);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                storeId: user.storeId,
                status: user.status,
                mustChangePassword: user.mustChangePassword,
            },
            token,
            refreshToken,
        };
    }

    // ==================== Refresh Token ====================
    static async refreshToken(refreshToken: string){
        // verify refresh token
        const decoded=verifyRefreshToken(refreshToken);
        if(!decoded){
            throw new Error('Yeniləmə tokeni etibarsızdır.');
        }

        // find user
        const user=await UserModel.findById(decoded.id);
        if(!user){
            throw new Error('İstifadəçi tapılmadı.');
        }

        // check if refresh token matches
        const userWithRefresh=await UserModel.findByEmail(user.email);
        if(userWithRefresh?.refreshToken !== refreshToken){
            throw new Error('Yeniləmə tokeni etibarsızdır.');
        }

        // generate new tokens
        const tokenPayload: TokenPayload={
            id: user.id, email: user.email, role: user.role, storeId: user.storeId || undefined,
        };

        const newToken=generateToken(tokenPayload);
        const newRefreshToken=generateRefreshToken({
            id: user.id,
            email: user.email,
            role: user.role,
            storeId: user.storeId || undefined,
        });

        // save new refresh token
        await UserModel.updateRefreshToken(user.id, newRefreshToken);

        return {token: newToken, refreshToken: newRefreshToken,            
        };
    }

    // ================= Logout ==================== //
    static async logout(userId: string): Promise<void> {
        await UserModel.updateRefreshToken(userId, null);
    }

    // ================== Forgot Password ================ //
    static async forgotPassword(email: string): Promise<void> {
        const user=await UserModel.findByEmail(email);
        if(!user){
            throw new Error('Bu e-poçt ünvanı ilə istifadəçi tapılmadı');
        }

        // generate reset token
        const resetToken=generateToken({
            id: user.id, email: user.email, role: user.role,
        });

        // send reset email;
        await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    }

    // =================== Reset Password ====================== //
    static async resetPassword(token: string, newPassword: string): Promise<void> {
        // verify token
        const decoded=verifyToken(token);
        if(!decoded){
            throw new Error('Şifrə sıfırlama tokeni etibarsızdır və ya müddəti bitib.');
        }

        // find user
        const user=await UserModel.findById(decoded.id);
        if(!user){
            throw new Error('İstifadəçi tapılmadı');
        }

        // update password
        await UserModel.updatePassword(user.id, newPassword);

        // ensure active status after reset
        if(user.status === 'PENDING' || user.status === 'MUST_CHANGE_PASSWORD'){
            await UserModel.update(user.id, { status: 'ACTIVE' });
        }

        // invalidate refresh token
        await UserModel.updateRefreshToken(user.id, null);
    }

    // ================= Change Password ================== //
    static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('İstifadəçi tapılmadı');
        }

        const isValid = await comparePassword(currentPassword, user.password);
        if (!isValid) {
            throw new Error('Cari şifrə yanlışdır.');
        }

        await UserModel.updatePassword(user.id, newPassword);

        if (user.status === 'MUST_CHANGE_PASSWORD' || user.status === 'PENDING') {
            await UserModel.update(user.id, { status: 'ACTIVE' });
        }

        await UserModel.updateRefreshToken(user.id, null);
    }

    //================ Accept Invitation =============== //
    static async acceptInvitation(inviteToken: string){
        const user = await InvitationService.acceptInvitation(inviteToken);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            storeId: user.store_id ?? user.storeId ?? null,
            status: user.status,
            mustChangePassword: user.must_change_password ?? user.mustChangePassword ?? true,
        };
    }

    // ==================== Invite User ==================== //
    static async invite(data: {
        name: string;
        email: string;
        role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'VIEWER';
        storeId?: string;
        invitedBy: string;
    }){
        const result = await InvitationService.inviteUser(data);
        return {
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
                storeId: result.user.store_id ?? result.user.storeId ?? null,
                status: result.user.status,
                inviteToken: result.user.invite_token ?? result.user.inviteToken ?? null,
            },
            password: result.password,
            inviteToken: result.inviteToken,
        };
    }

    //=============== Get Current User ================ //
    static async getCurrentUser(userId: string){
        const user=await UserModel.findById(userId);
        if(!user){
            throw new Error('İstifadəçi tapılmadı');
        }
        return user;
    }
}

