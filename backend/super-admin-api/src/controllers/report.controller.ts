import { Request, Response } from 'express';
import * as reportService from '../services/report.service';

export const getSalesSummary = async (req: Request | any, res: Response) => {
  try {
    const storeId = req.user?.storeId;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    
    const summary = await reportService.getSalesSummary(storeId, startDate, endDate);
    return res.json(summary);
  } catch (error: any) {
    console.error('Get sales summary error:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve sales summary' });
  }
};

export const getTopProducts = async (req: Request | any, res: Response) => {
  try {
    const storeId = req.user?.storeId;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    
    const products = await reportService.getTopProducts(storeId, startDate, endDate);
    return res.json(products);
  } catch (error: any) {
    console.error('Get top products error:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve top products' });
  }
};
