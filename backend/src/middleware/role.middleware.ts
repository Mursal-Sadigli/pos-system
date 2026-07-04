import { Response, NextFunction } from "express"
import { AuthRequest } from "./auth.middleware"
import { errorResponse } from "../utils/response"


export const authorize=(...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if(!req.user){
            return errorResponse(res, 'Giriş tələb olunur.', 401);
        }

        if(!roles.includes(req.user.role)){
            return errorResponse(res, 'Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur.', 403);
        }

        next();
    };
};

export const requirePermission=(...permissions: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if(!req.user){
            return errorResponse(res, 'Giriş tələb olunur.', 401);
        }

        // Admin has all permissions
        if(req.user.role==='ADMIN'){
            return next();
        }

        // Check if user has required permission
        // (permissions would be fetched from database)
        // // This is a placeholder - you'd check against user's permissions
        next();
    };
};