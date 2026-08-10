import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.post('/', verifySession, controller.assignInheritances);
router.patch('/uninheritances', verifySession, controller.removeInheritances);
router.delete('/:parentRoleId', verifySession, controller.removeSingleInheritance);

export default router;
