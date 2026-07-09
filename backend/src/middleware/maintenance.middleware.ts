import { Request, Response, NextFunction } from "express";
import { GeneralSettingModel } from "../models/GeneralSetting.model";
import { verifyToken } from "../utils/jwt";
import { errorResponse } from "../utils/response";

export const maintenanceMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await GeneralSettingModel.getSettings();

    if (settings && settings.maintenanceMode) {
      // Allow login so admins can authenticate
      if (req.path.includes("/auth/login") || req.path.includes("/auth/refresh")) {
        next();
        return;
      }

      // Check if user is admin via token
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer")) {
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        if (decoded && (decoded.role === "ADMIN" || decoded.role === "SUPER_ADMIN")) {
          next();
          return;
        }
      }

      // If not an admin and not logging in, block access
      res.status(503).json({
        success: false,
        message: "Sistem hal-hazırda baxım rejimindədir. Zəhmət olmasa daha sonra təkrar cəhd edin.",
      });
      return;
    }

    next();
  } catch (error) {
    next(); // Fallback to allowing access if settings cannot be read
  }
};
