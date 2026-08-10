import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.get('/', verifySession, controller.getRolePermissions);
router.post('/', verifySession, controller.assignRolePermissions);
router.delete('/:permissionId', verifySession, controller.removeSingleRolePermission);

export default router;
