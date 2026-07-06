import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), UserController.getUsers);

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.put('/profile/password', authenticate, UserController.updatePassword);
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), UserController.getUser);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), UserController.updateUser);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), UserController.deleteUser);

export default router;
