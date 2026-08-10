import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.get('/', verifySession, controller.getUserRoles);
router.post('/', verifySession, controller.assignUserRoles);
router.delete('/:roleId', verifySession, controller.removeSingleUserRole);

export default router;
