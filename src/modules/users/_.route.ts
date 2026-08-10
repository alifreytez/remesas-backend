import { Router } from 'express';
import controller from './_.controller.js';
import { verifySession } from '@middlewares/auth.middleware.js';
import meRoutes from './me/_.route.js';
import permissionsRoutes from './permissions/_.route.js';
import rolesRoutes from './roles/_.route.js';

const router = Router();

// Rutas específicas del usuario autenticado (/me) delegadas a subcarpeta me/
router.use('/me', meRoutes);

// RBAC: Permisos del usuario
router.use('/:id/permissions', permissionsRoutes);

// RBAC: Roles del usuario
router.use('/:id/roles', rolesRoutes);

// Rutas generales y parametrizadas de usuarios
router.get('/', verifySession, controller.getAllFullUsers);

// Operaciones CRUD sobre usuario
router.get('/:id', verifySession, controller.getFullUser);
router.post('/', verifySession, controller.createUser);
router.patch('/:id/restore', verifySession, controller.restoreUser);
router.patch('/:id', verifySession, controller.updateUser);
router.delete('/:id', verifySession, controller.deleteUser);

export default router;
