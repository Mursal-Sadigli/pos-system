import { Router } from 'express';

import authRoutes from './auth.routes';
import invitationRoutes from './invitation.routes';
import usersRoutes from './users.routes';
import storesRoutes from './stores.routes';

const router = Router();



router.use('/invitation', invitationRoutes);
router.use('/users', usersRoutes);
router.use('/stores', storesRoutes);

export default router;
