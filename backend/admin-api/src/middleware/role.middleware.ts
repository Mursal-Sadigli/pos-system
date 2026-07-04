import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { errorResponse } from '../utils/response';

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
    next();
  };
};

export const requireAdmin = authorize('SUPER_ADMIN', 'ADMIN');
export const requireManager = authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER');
