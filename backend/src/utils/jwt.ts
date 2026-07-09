import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { StringValue } from 'ms';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as StringValue;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret';
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN ?? '30d') as StringValue;

export interface TokenPayload{
    id: string;
    email: string;
    role: string;
    storeId?: string;
}

// Genereate Access Token
export const generateToken = (payload: any, expiresIn?: string): string => {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: (expiresIn ?? JWT_EXPIRES_IN) as StringValue});
}

// Generate Refresh Token
export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRES_IN});
};

// Verify Access Token
export const verifyToken=(token: string): TokenPayload | null => {
    try{
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    }catch(error){
        return null;
    }
};

// Verify Refresh Token
export const verifyRefreshToken=(token: string): {id: string} | null => {
    try{
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as {id: string};
    }catch(error){
        return null;
    }
};

// Decode Token without verification
export const decodeToken=(token: string): TokenPayload | null => {
    try{
        return jwt.decode(token) as TokenPayload;
    }catch(error){
        return null;
    }
};