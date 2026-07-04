import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = (process.env.JWT_SECRET || 'super-admin-jwt-secret') as Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET = (process.env.REFRESH_TOKEN_SECRET || 'super-admin-refresh-secret') as Secret;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  storeId?: string;
}

const jwtSignOptions = (expiresIn: string): SignOptions => ({ expiresIn: expiresIn as SignOptions['expiresIn'] });

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, jwtSignOptions(JWT_EXPIRES_IN));
};

export const generateRefreshToken = (payload: { id: string }): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, jwtSignOptions(REFRESH_TOKEN_EXPIRES_IN));
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { id: string };
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
};