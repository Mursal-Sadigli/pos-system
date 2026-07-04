import { z } from 'zod';

// Register validation
export const registerSchema=z.object({
    name: z.string()
        .min(2, 'Ad ən azı 2 simvoldan ibarət olmalıdır.')
        .max(50, 'Ad 50 simvoldan çox ola bilməz.')
        .trim(),
    email: z.string()
        .email('E-poçt ünvanı düzgün deyil.')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(6, 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.')
        .max(100, 'Şifrə 100 simvoldan çox ola bilməz'),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'VIEWER'])
        .optional()
        .default('CASHIER'),
    storeId: z.string().uuid('Mağaza ID-si etibarsızdır.').optional(),
});

// login validation
export const loginSchema=z.object({
    email: z.string()
       .email('E-poçt ünvanı düzgün deyil.')
       .toLowerCase()
       .trim(),
    password: z.string()
        .min(1, 'Şifrə daxil edilməlidir.'),
});

// refresh token validation
export const refreshTokenSchema=z.object({
    refreshToken: z.string().min(1, 'Yeniləmə tokeni tələb olunur.'),
});

// forgot password validation
export const forgotPasswordSchema=z.object({
    email: z.string()
        .email('E-poçt ünvanı düzgün deyil.')
        .toLowerCase()
        .trim(),
});

// reset password validation
export const resetPasswordSchema=z.object({
    token: z.string().min(1, 'Yeniləmə tokeni tələb olunur.'),
    newPassword: z.string()
        .min(6, 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.')
        .max(100, 'Şifrə 100 simvoldan çox ola bilməz.'),
});

export const acceptInviteSchema=z.object({
    token: z.string().min(1, 'Dəvət tokeni tələb olunur.'),
});

export const inviteSchema=z.object({
    name: z.string()
        .min(2, 'Ad ən azı 2 simvoldan ibarət olmalıdır.')
        .max(50, 'Ad 50 simvoldan çox ola bilməz.')
        .trim(),
    email: z.string()
        .email('E-poçt ünvanı düzgün deyil.')
        .toLowerCase()
        .trim(),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'VIEWER']),
    storeId: z.string().uuid('Mağaza ID-si etibarsızdır.').optional(),
});

// change password validation (authenticated)
export const changePasswordSchema=z.object({
    currentPassword: z.string().min(1, 'Cari şifrə daxil edilməlidir.'),
    newPassword: z.string()
        .min(6, 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.')
        .max(100, 'Şifrə 100 simvoldan çox ola bilməz.'),
});

export type RegisterInput=z.infer<typeof registerSchema>;
export type LoginInput=z.infer<typeof loginSchema>;
export type RefreshTokenInput=z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput=z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput=z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput=z.infer<typeof changePasswordSchema>;