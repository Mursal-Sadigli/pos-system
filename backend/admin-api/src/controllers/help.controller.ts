import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { HelpService } from '../services/help.service';
import { successResponse, errorResponse } from '../utils/response';
import { query, schemaQualified } from '../config/database';

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
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }
      let storeId = req.user.storeId;
      if (!storeId) {
        // SUPER_ADMIN may have no storeId - try to get from DB or use first store
        const userRow = await query(`SELECT store_id FROM ${schemaQualified}.users WHERE id = $1`, [req.user.id]);
        storeId = userRow.rows[0]?.store_id;
        if (!storeId) {
          const storeRow = await query(`SELECT id FROM ${schemaQualified}.stores LIMIT 1`);
          storeId = storeRow.rows[0]?.id;
        }
      }
      if (!storeId) {
        return successResponse(res, [], 'Mağaza tapılmadı');
      }
      const tickets = await HelpService.getTickets(storeId, req.user.id);
      return successResponse(res, tickets);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }

  // POST /api/help/tickets
  static async createTicket(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const { subject, message } = req.body;
      if (!subject || !message) {
        return errorResponse(res, 'Mövzu və mesaj mütləqdir', 400);
      }

      let storeId = req.user.storeId;
      if (!storeId) {
        // SUPER_ADMIN may have no storeId - try to get from DB or use first store
        const userRow = await query(`SELECT store_id FROM ${schemaQualified}.users WHERE id = $1`, [req.user.id]);
        storeId = userRow.rows[0]?.store_id;
        if (!storeId) {
          const storeRow = await query(`SELECT id FROM ${schemaQualified}.stores LIMIT 1`);
          storeId = storeRow.rows[0]?.id;
        }
      }
      if (!storeId) {
        return errorResponse(res, 'Mağaza tapılmadı', 400);
      }

      const ticket = await HelpService.createTicket(storeId, req.user.id, subject, message);
      return successResponse(res, ticket, 'Müraciətiniz uğurla göndərildi');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
