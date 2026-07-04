import { Request } from 'express';

// Rate limit məlumatlarını əldə et
export const getRateLimitInfo = (req: Request) => {
  const limit = req.headers['x-ratelimit-limit'];
  const remaining = req.headers['x-ratelimit-remaining'];
  const reset = req.headers['x-ratelimit-reset'];

  return {
    limit: limit ? parseInt(limit as string) : null,
    remaining: remaining ? parseInt(remaining as string) : null,
    reset: reset ? new Date(parseInt(reset as string) * 1000) : null,
  };
};

// Rate limit headers əlavə et (əgər yoxdursa)
export const addRateLimitHeaders = (req: Request, res: any, next: any) => {
  // Default headers
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', '95');
  res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 900);
  next();
};