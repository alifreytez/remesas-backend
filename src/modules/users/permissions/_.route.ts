import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.get('/', verifySession, controller.getUserPermissions);
router.post('/', verifySession, controller.grantUserPermissions);
router.post('/grants', verifySession, controller.grantUserPermissions);
router.post('/excludes', verifySession, controller.excludeUserPermissions);
router.delete('/:permissionId', verifySession, controller.removeSingleUserPermission);

export default router;
