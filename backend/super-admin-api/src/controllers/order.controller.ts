import { Request, Response } from 'express';
import * as orderService from '../services/order.service';

export const createOrder = async (req: Request | any, res: Response) => {
  try {
    const orderData = req.body;
    
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    
    // Attach store_id from authenticated user if available
    if (req.user && req.user.storeId) {
      orderData.store_id = req.user.storeId;
    }
    
    const newOrder = await orderService.createOrder(orderData);
    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getOrders = async (req: Request | any, res: Response) => {
  try {
    const storeId = req.user?.storeId;
    const orders = await orderService.getOrders(storeId);
    return res.json(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve orders' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ error: 'ID and status are required' });
    }
    
    const updatedOrder = await orderService.updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.json(updatedOrder);
  } catch (error: any) {
    console.error('Update order error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update order status' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const deletedOrder = await orderService.deleteOrder(id);
    if (!deletedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    return res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete order' });
  }
};
