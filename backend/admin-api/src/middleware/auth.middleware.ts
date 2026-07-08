import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { errorResponse } from '../utils/response';
import { query, schemaQualified } from '../config/database';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }

  // Verify token_version to detect revoked sessions
  if (decoded.tokenVersion !== undefined) {
    try {
      const result = await query(
        `SELECT token_version FROM ${schemaQualified}.users WHERE id = $1`,
        [decoded.id]
      );
      const dbVersion = result.rows[0]?.token_version ?? 0;
      if (decoded.tokenVersion < dbVersion) {
        return errorResponse(res, 'Session has been revoked. Please log in again.', 401);
      }
    } catch {
      // If DB check fails, allow request through (fail-open for availability)
    }
  }

  req.user = decoded;
  next();
};
