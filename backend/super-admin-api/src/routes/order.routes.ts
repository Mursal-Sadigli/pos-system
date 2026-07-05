import { Router } from 'express';
import { createOrder, getOrders } from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Bütün istifadəçilər (Cashier, Admin) sifariş yarada və görə bilər
router.post('/', authMiddleware, createOrder as any);
router.get('/', authMiddleware, getOrders as any);

export default router;
