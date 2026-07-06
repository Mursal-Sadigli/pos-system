import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import storesRoutes from './stores.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/stores', storesRoutes);

export default router;
