import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import storesRoutes from './stores.routes';
import notificationsRoutes from './notifications.routes';
import reportsRoutes from './reports.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/stores', storesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reports', reportsRoutes);

export default router;
