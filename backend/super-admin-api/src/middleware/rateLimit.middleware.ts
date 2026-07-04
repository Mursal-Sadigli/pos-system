import { Request, Response, NextFunction } from 'express';

const requestCounts = new Map<string, { count: number; expiresAt: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

const shouldBypass = (req: Request) => {
  const path = req.path || '';
  const authHeader = req.headers.authorization;
  const isAuthenticated = Boolean(authHeader && authHeader.startsWith('Bearer '));

  return path === '/health' || path.startsWith('/auth/') || isAuthenticated;
};

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (shouldBypass(req)) {
    return next();
  }

  const key = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.expiresAt) {
    requestCounts.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  }

  entry.count += 1;
  requestCounts.set(key, entry);
  next();
};
