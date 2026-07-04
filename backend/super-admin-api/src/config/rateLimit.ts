import rateLimit from 'express-rate-limit';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
  };
}

// ==================== ÜMUMİ RATE LIMIT ====================
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dəqiqə
  max: 100, // Hər IP-dən maksimum 100 sorğu
  message: {
    success: false,
    message: 'Çox sayda sorğu göndərdiniz. Zəhmət olmasa bir müddət sonra yenidən cəhd edin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: AuthenticatedRequest) => {
    // Admin və Super Admin üçün limiti artır
    const role = req.user?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  },
});

// ==================== AUTH RATE LIMIT (Login, Register) ====================
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dəqiqə
  max: 10, // Hər IP-dən maksimum 10 sorğu
  message: {
    success: false,
    message: 'Çox sayda giriş cəhdi. Zəhmət olmasa 15 dəqiqə sonra yenidən cəhd edin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Uğurlu girişləri sayma
});

// ==================== STRICT RATE LIMIT (Şifrə sıfırlama, dəvət) ====================
export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5, // Hər IP-dən maksimum 5 sorğu
  message: {
    success: false,
    message: 'Çox sayda cəhd. Zəhmət olmasa 1 saat sonra yenidən cəhd edin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== API RATE LIMIT (CRUD əməliyyatları) ====================
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 dəqiqə
  max: 30, // Hər IP-dən maksimum 30 sorğu
  message: {
    success: false,
    message: 'Çox sayda sorğu. Zəhmət olmasa bir dəqiqə sonra yenidən cəhd edin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: AuthenticatedRequest) => {
    const role = req.user?.role;
    return role === 'SUPER_ADMIN';
  },
});

// ==================== CUSTOM RATE LIMIT (İstifadəçiyə görə) ====================
export const userRateLimit = (maxRequests: number = 20, windowMs: number = 60000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      message: `Maksimum ${maxRequests} sorğu limitinə çatdınız.`,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: AuthenticatedRequest) => {
      // İstifadəçi ID-si ilə limitlə (əgər varsa)
      return req.user?.id || req.ip || 'anonymous';
    },
  });
};

// ==================== IP əsaslı rate limit ====================
export const ipRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 dəqiqə
  max: 60, // Hər IP-dən maksimum 60 sorğu
  message: {
    success: false,
    message: 'IP ünvanınızdan çox sayda sorğu göndərildi.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});