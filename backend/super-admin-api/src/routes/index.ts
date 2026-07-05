import { Router } from 'express';

import authRoutes from './auth.routes';
import invitationRoutes from './invitation.routes';
import usersRoutes from './users.routes';
import storesRoutes from './stores.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';

const router = Router();



router.use('/auth', authRoutes);
router.use('/invitation', invitationRoutes);
router.use('/users', usersRoutes);
router.use('/stores', storesRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

export default router;
