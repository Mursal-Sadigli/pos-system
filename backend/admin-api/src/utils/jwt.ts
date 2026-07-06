import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-admin-jwt-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'super-admin-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  storeId?: string;
}

const secretOrKey = JWT_SECRET as jwt.Secret;
const refreshSecretOrKey = REFRESH_TOKEN_SECRET as jwt.Secret;

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, secretOrKey, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const generateRefreshToken = (payload: { id: string }): string => {
  return jwt.sign(payload, refreshSecretOrKey, { expiresIn: REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: string };
  } catch {
    return null;
  }
};
