import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";


export class AuthController{
    // ============= Register =========== //
    static async register(req: Request, res: Response){
        try {
            const { GeneralSettingModel } = require('../models/GeneralSetting.model');
            const settings = await GeneralSettingModel.getSettings();
            
            if (settings && !settings.allowRegistration) {
                throw new Error('Açıq qeydiyyat deaktiv edilib. Yeni istifadəçi üçün admin dəvəti gözləyin.');
            }
            
            // Allow registration if setting is enabled
            const { AuthService } = require('../services/auth.service');
            const result = await AuthService.register(req.body);
            return successResponse(res, result, 'Uğurla qeydiyyatdan keçdiniz.');
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'Qeydiyyat uğursuz oldu.', 400);
        }
    }

    // ============== Accept Invitation =============== //
    static async acceptInvitation(req: Request, res: Response){
        try {
            const { token } = req.body;
            const user = await AuthService.acceptInvitation(token);
            return successResponse(res, user, 'Dəvət uğurla qəbul edildi. Şifrənizi dəyişin.');
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'Dəvət qəbul edilə bilmədi.', 400);
        }
    }

    // ============== Login =============== //
    static async login(req: Request, res: Response){
        try {
            const {email, password} = req.body;
            const result=await AuthService.login(email, password);
            return successResponse(res, result, 'Giriş uğurla həyata keçirildi.');
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'Giriş uğursuz oldu.', 401);
        };
    }

    // =============== Refresh Token =============== //
    static async refreshToken(req: Request, res: Response){
        try {
            const {refreshToken} = req.body;
            const result=await AuthService.refreshToken(refreshToken);

            return successResponse(res, result, 'Token uğurla yeniləndi.');
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'Token yenilənə bilmədi.', 401);
        }
    }

    // =============== Invite User =============== //
    static async invite(req: AuthRequest, res: Response){
        try {
            if(!req.user){
                return errorResponse(res, 'İstifadəçi tapılmadı.', 401);
            }

            const {name, email, role, storeId} = req.body;
            const result = await AuthService.invite({
                name,
                email,
                role,
                storeId,
                invitedBy: req.user.id,
            });

            return successResponse(res, result, 'İstifadəçiyə dəvət göndərildi.', 201);
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'Dəvət göndərilə bilmədi.', 400);
        }
    }

    // ============= Logout ============== //
    static async logout(req: AuthRequest, res: Response){
        try {
            if(!req.user){
                return errorResponse(res, 'İstifadəçi tapılmadı.', 401);
            }

            await AuthService.logout(req.user.id);
            return successResponse(res, null, 'Çıxış uğurla həyata keçirildi.');
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'Çıxış uğursuz oldu.', 500);
        }
    }

    // ============= Forgot Password ========== //
    static async forgotPassword(req: Request, res:Response){
        try {
            const {email}=req.body;
            await AuthService.forgotPassword(email);
            return successResponse(res, null, 'Şifrəni sıfırlamaq üçün keçid e-poçt ünvanınıza göndərildi.');
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'Şifrə sıfırlama keçidi göndərilə bilmədi.', 400);
        }
    }

    // ============= Reset Password ================== //
    static async resetPassword(req: Request, res: Response){
        try {
            const {token, newPassword} = req.body;
            await AuthService.resetPassword(token, newPassword);
            return successResponse(res, null, 'Şifrə uğurla yeniləndi.');
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'Şifrə yenilənə bilmədi.', 400);
        }
    }

    // =============== Get Current User =============== //
    static async getMe(req: AuthRequest, res: Response){
        try {
            if(!req.user){
                return errorResponse(res, 'İstifadəçi tapılmadı.', 401);
            }

            const user=await AuthService.getCurrentUser(req.user.id);
            return successResponse(res, user, 'İstifadəçi tapıldı.');
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'İstifadəçi məlumatları əldə edilə bilmədi.', 404);
        }
    }

    // ================= Change Password =============== //
    static async changePassword(req: AuthRequest, res: Response){
        try {
            if(!req.user){
                return errorResponse(res, 'İstifadəçi tapılmadı.', 401);
            }

            const {currentPassword, newPassword} = req.body;
            await AuthService.changePassword(req.user.id, currentPassword, newPassword);

            return successResponse(res, null, 'Şifrə uğurla dəyişdirildi.');
        } catch (error) {
            return errorResponse(res, error instanceof Error ? error.message : 'Şifrə dəyişdirilə bilmədi.', 400);
        }
    }
}