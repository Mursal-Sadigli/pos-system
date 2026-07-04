import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), StoreController.getStores);
router.get('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'MANAGER'), StoreController.getStore);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), StoreController.createStore);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), StoreController.updateStore);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), StoreController.deleteStore);

export default router;
