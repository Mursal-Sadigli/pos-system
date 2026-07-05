import { Request, Response } from 'express';
import * as orderService from '../services/order.service';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    const newOrder = await orderService.createOrder(orderData);
    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getOrders();
    res.json(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
