import { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus, deleteOrder } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Bütün istifadəçilər (Cashier, Admin) sifariş yarada və görə bilər
router.post('/', authenticate as any, createOrder as any);
router.get('/', authenticate as any, getOrders as any);
router.patch('/:id/status', authenticate as any, updateOrderStatus as any);
router.delete('/:id', authenticate as any, deleteOrder as any);

export default router;
