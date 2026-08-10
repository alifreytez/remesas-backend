import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';

const router = Router();

router.get('/types', controller.getPermissionTypes);
router.get('/actions', controller.getPermissionActions);
router.get('/resources', controller.getPermissionResources);

router.get('/', verifySession, controller.getAllFullPermissions);
router.get('/:id', verifySession, controller.getFullPermission);
router.post('/', verifySession, controller.createPermission);
router.patch('/:id', verifySession, controller.updatePermission);
router.delete('/:id', verifySession, controller.deletePermission);
router.delete('/', verifySession, controller.deletePermission);

export default router;
