import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import authRoutes from './auth.routes';
import invitationRoutes from './invitation.routes';
import usersRoutes from './users.routes';
import storesRoutes from './stores.routes';

const router = Router();

// Alias for direct login without /api prefix
router.post('/login', AuthController.login);

router.use('/invitation', invitationRoutes);
router.use('/users', usersRoutes);
router.use('/stores', storesRoutes);

export default router;
