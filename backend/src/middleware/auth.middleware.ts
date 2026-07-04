import { Request, Response, NextFunction } from "express";
import { TokenPayload, verifyToken } from "../utils/jwt";
import { errorResponse } from "../utils/response";


export interface AuthRequest extends Request{
    user?: TokenPayload;
}

export const authenticate=async(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer')){
            return errorResponse(res, 'Authentication required', 401);
        }

        const token=authHeader.split(' ')[1];
        const decoded=verifyToken(token);

        if(!decoded){
            return errorResponse(res, 'Invalid or expired token', 401);
        }

        req.user=decoded;
        next();
    } catch (error) {
        return errorResponse(res, 'Authentication failed', 401);
    }
};