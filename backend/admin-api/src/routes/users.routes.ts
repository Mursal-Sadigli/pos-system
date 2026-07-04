import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), UserController.getUsers);

export default router;
