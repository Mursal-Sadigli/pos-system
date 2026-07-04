import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Düzgün email daxil edin'),
    password: z.string().min(6, 'Şifrə ən az 6 simvol olmalıdır'),
  }),
});

export const inviteSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Ad ən az 2 simvol olmalıdır'),
    email: z.string().email('Düzgün email daxil edin'),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER', 'VIEWER']),
    storeId: z.string().optional(),
  }),
});

export const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Dəvət tokeni tələb olunur'),
  }),
});

export const resendInviteSchema = z.object({
  body: z.object({
    email: z.string().email('Düzgün email daxil edin'),
  }),
});
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Cari şifrə tələb olunur'),
    newPassword: z.string().min(6, 'Yeni şifrə ən az 6 simvol olmalıdır'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token tələb olunur'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Düzgün email daxil edin'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token tələb olunur'),
    newPassword: z.string().min(6, 'Yeni şifrə ən az 6 simvol olmalıdır'),
  }),
});
