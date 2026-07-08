import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { HelpService } from '../services/help.service';
import { successResponse, errorResponse } from '../utils/response';

export class HelpController {
  // GET /api/help/faqs
  static async getFaqs(req: AuthRequest, res: Response) {
    try {
      const faqs = await HelpService.getFaqs();
      return successResponse(res, faqs);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // GET /api/help/system-info
  static async getSystemInfo(req: AuthRequest, res: Response) {
    try {
      const info = HelpService.getSystemInfo();
      return successResponse(res, info);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // GET /api/help/tickets
  static async getTickets(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user.storeId) {
        return errorResponse(res, 'Authentication required', 401);
      }
      const tickets = await HelpService.getTickets(req.user.storeId, req.user.id);
      return successResponse(res, tickets);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // POST /api/help/tickets
  static async createTicket(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user.storeId) {
        return errorResponse(res, 'Authentication required', 401);
      }
      
      const { subject, message } = req.body;
      if (!subject || !message) {
        return errorResponse(res, 'Mövzu və mesaj mütləqdir', 400);
      }

      const ticket = await HelpService.createTicket(req.user.storeId, req.user.id, subject, message);
      return successResponse(res, ticket, 'Müraciətiniz uğurla göndərildi');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
