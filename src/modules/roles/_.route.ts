import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';
import inheritancesRoutes from './inheritances/_.route.js';
import permissionsRoutes from './permissions/_.route.js';

const router = Router();

router.get('/', verifySession, controller.getAllFullRoles);

// RBAC: Herencias entre roles
router.use('/:id/inheritances', inheritancesRoutes);

// RBAC: Permisos del rol
router.use('/:id/permissions', permissionsRoutes);

// Operaciones CRUD sobre roles
router.get('/:id', verifySession, controller.getFullRole);
router.post('/', verifySession, controller.createRole);
router.patch('/:id', verifySession, controller.updateRole);
router.delete('/:id', verifySession, controller.deleteRole);
router.delete('/', verifySession, controller.deleteRole);

export default router;
